import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Icon, Checkbox, Input } from 'semantic-ui-react';
import { get } from 'lodash/object';
import { filter, map, find, reduce, each, some } from 'lodash/collection';
import { uniq, difference } from 'lodash/array';
import { isEmpty } from 'lodash/lang';
import { connect } from 'react-redux';
import ReactTree from 'rc-tree';
import 'rc-tree/assets/index.css';

import { TEMPLATES } from './constants';
import { parseOptions } from '../../../../helpers';
import PlasticineApi from '../../../../api';

class ReferenceToListTree extends Component {
  static propTypes = {
    model: PropTypes.string,
    tree: PropTypes.number,
    name: PropTypes.any.isRequired,
    value: PropTypes.any,
    disabled: PropTypes.bool,
    inline: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.configs = props.configs;

    this.state = {
      items: [],

      checkedKeys: [],
      expandedKeys: [],

      checkedAll: false,
      expandedAll: false,
      expandedChecked: false,
    };
  }

  componentDidMount = async () => {
    await this.loadContent(this.props);
  }

  componentWillReceiveProps = async (nextProps) => {
    const forceLoad = (this.props.tree !== nextProps.tree);

    if ((this.props.model !== nextProps.model) || !nextProps.tree) {
      return this.setState({ items: [] });
    }

    forceLoad && await this.loadContent(nextProps, forceLoad);
  }

  loadContent = async (props, force) => {
    await this.loadTree(props, force);
    await this.loadFields(force);

    this.setTemplates();
    this.setItems(props.value, force);

    if (force || !this.tree) {
      this.props.onChange(null, { value: [] });
      this.setState({ checkedKeys: [], expandedKeys: [], checkedAll: false, expandedAll: false })
    }
  }

  loadTree = async (props, force) => {
    if ((!force && this.tree) || !props.tree) return;

    const { data = {} } = await PlasticineApi.fetchRecord(props.model, props.tree);
    const { meta = {} } = data;

    this.tree = meta.tree;
  }

  loadFields = async (force) => {
    if (!force && (this.fields || !this.tree)) return;
    if (force && !this.tree) return;

    const ids = []

    each(this.tree.templates, ({ template }) => {
      each(parseOptions(template).attr, (item) => {
        if (item.p !== -1) ids.push(item.p);
        ids.push(item.f);
      });
    });

    const { data: { data: result } } = await PlasticineApi.fetchRecords('field', { filter: `id IN (${uniq(ids)})`, page: { size: 10000 } });

    this.fields = map(result, ({ id, attributes }) => ({ id, ...attributes }));
  }

  setTemplates = () => {
    const { templates = [] } = this.configs;

    this.templates = [...TEMPLATES, ...templates].map(template => ({
      internalType: template.key,
      icon: <Icon name={template.icon} />,
    }));
  }

  setItems = (value) => {
    if (!this.tree) return;

    this.items = [];

    each(this.tree.templates, ({ name, template }, i) => {
      const items = parseOptions(template).attr;

      if (this.tree.type === 'common') {
        each(items, (item) => {
          this.items.push(item);
        });
      }

      if (this.tree.type === 'compound') {
        const f = `parent_${i}`;
        const field = { id: f, alias: `folder_${f}`, name, options: '{"subtype":"folder"}' };

        const parentField = find(this.fields, { id: f });
        const parentItem = find(this.items, { f });

        !parentField && this.fields.push(field);
        !parentItem && this.items.push({ p: -1, f });

        each(items, (item) => {
          if (item.p === -1) item.p = f;
          this.items.push(item);
        });
      }
    });

    const checkedKeys = [];
    const parentItems = filter(this.items, ({ p }) => p === -1);
    const items = map(parentItems, item => this.generateItem(item, value, checkedKeys));

    const checkedAll = filter(this.fields, ({ alias }) => !alias.includes('_parent_')).length === checkedKeys.length;

    this.setState({ items, checkedKeys, checkedAll });
  }

  generateItem = (item, value, checkedKeys) => {
    const field = find(this.fields, { id: item.f });
    const children = filter(this.items, { p: item.f });
    const internalType = field.alias.split('_')[0];
    const icon = find(this.templates, { internalType }).icon;
    const isChecked = value.includes(field.id);
    const title = field.alias.includes('_parent_') ? field.name : `${field.name} (${internalType})`;

    const props = {
      ...field,
      key: field.alias,
      title,
      icon,
      parent: item.p,
      internalType,
      className: internalType,
    };

    if (isChecked) (props.checkedKeys = isChecked) && checkedKeys.push(field.alias);
    if (internalType === 'folder') props.children = isEmpty(children) ? [] : map(children, i => this.generateItem(i, value, checkedKeys));

    return props;
  }

  handleCheck = (checkedKeys) => {
    const value = map(
      filter(checkedKeys, (key) => !key.includes('_parent_')),
      (key) => find(this.fields, { alias: key }).id,
    );

    this.props.onChange(null, { value });
    this.setState({ checkedKeys });
  }

  handleExpand = (expandedKeys) => {
    const parents = uniq(map(filter(this.items, ({ p }) => (p !== -1)), 'p'));
    const expandedAll = (parents.length === expandedKeys.length);
    const expandedChecked = expandedAll || !difference(
      expandedKeys,
      filter(this.state.checkedKeys, (key) => key.startsWith('folder')),
    ).length;

    this.setState({
      expandedKeys,
      expandedAll,
      expandedChecked,
    });
  }

  handleCheckAll = () => {
    const value = map(filter(this.fields, ({ alias }) => !alias.includes('_parent_')), 'id');
    const checkedKeys = map(this.fields, 'alias');

    this.props.onChange(null, { value });
    this.setState({ checkedKeys, checkedAll: true });
  }

  handleUncheckedAll = () => {
    this.props.onChange(null, { value: [] });
    this.setState({ checkedKeys: [], checkedAll: false });
  }

  handleExpandAll = () => {
    this.setState({
      expandedKeys: map(filter(this.fields, (f) => parseOptions(f.options).subtype === 'folder'), 'alias'),
      expandedAll: true,
      expandedChecked: true,
    });
  }

  handleCollapseAll = () => {
    this.setState({
      expandedKeys: [],
      expandedAll: false,
      expandedChecked: false,
    });
  }

  handleExpandChecked = () => {
    const parents = uniq(map(filter(this.items, ({ p }) => (p !== -1)), 'p'));
    const expandedKeys = [ ...this.state.expandedKeys ];

    each(
      filter(this.fields, ({ alias }) => this.state.checkedKeys.includes(alias)),
      ({ id, alias }) => {
        const item = find(this.items, ({ f }) => f === id);
        const parentItem = find(this.fields, { id: item.p });
        parentItem && expandedKeys.push(parentItem.alias);
      }
    );

    this.setState({
      expandedKeys: uniq(expandedKeys),
      expandedAll: (parents.length === uniq(expandedKeys).length),
      expandedChecked: true,
    });
  }

  handleCollapseChecked = () => {
    const parents = uniq(map(filter(this.items, ({ p }) => (p !== -1)), 'p'));
    const collapsed = [];

    each(
      filter(this.fields, ({ alias }) => this.state.checkedKeys.includes(alias)),
      ({ id, alias }) => {
        const item = find(this.items, ({ f }) => f === id);
        collapsed.push(find(this.fields, { id: item.f }).alias);
      }
    );

    const expandedKeys = difference(this.state.expandedKeys, collapsed);

    this.setState({
      expandedKeys,
      expandedAll: (parents.length === expandedKeys.length),
      expandedChecked: false,
    });
  }

  renderPlaceholder() {
    const value = i18n.t('no_data', { defaultValue: 'No data' });

    return (
      <Form.Input
        disabled
        label={this.props.name}
        value={value}
        inline={this.props.inline}
      />
    );
  }

  renderCheckControl(style) {
    return this.state.checkedAll
      ? <Icon style={style.icon} onClick={this.handleUncheckedAll} name="square outline" title={i18n.t('deselect_all', { defaultValue: 'Deselect all' })} />
      : <Icon style={style.icon} onClick={this.handleCheckAll} name="check square outline" title={i18n.t('select_all', { defaultValue: 'Select all' })} />;
  }

  renderExpandControl(style) {
    return this.state.expandedAll
      ? <Icon style={style.icon} onClick={this.handleCollapseAll} name="angle right" title={i18n.t('collapse_all', { defaultValue: 'Collapse all' })} />
      : <Icon style={style.icon} onClick={this.handleExpandAll} name="angle down" title={i18n.t('expand_all', { defaultValue: 'Expand all' })} />;
  }

  renderExpandCheckedControl(style) {
    const active = some(
      filter(this.items, ({ p }) => (p !== -1)),
      ({ f }) => find(this.fields, ({ id, alias }) => (id === f) && this.state.checkedKeys.includes(alias)),
    );

    const iconStyle = { ...style.icon };
    if (!active) {
      iconStyle.pointerEvents = 'none';
      iconStyle.opacity = 0.4;
    }

    return this.state.expandedChecked
      ? <Icon style={iconStyle} onClick={this.handleCollapseChecked} name="angle double right" title={i18n.t('collapse_checked', { defaultValue: 'Collapse checked' })} />
      : <Icon style={iconStyle} onClick={this.handleExpandChecked} name="angle double down" title={i18n.t('expand_checked', { defaultValue: 'Expand checked' })} />;
  }

  renderTreeControl() {
    const { checkedAll, expandedAll, expandedChecked } = this.state;

    const style = {
      controls: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '21px', margin: '4px 0 0 4px', fontSize: '17px' },
      icon: { margin: '0 0 4px', cursor: 'pointer' },
    };

    return (
      <div style={style.controls} className="tree-control">
        {this.renderCheckControl(style)}
        {this.renderExpandControl(style)}
        {this.renderExpandCheckedControl(style)}
      </div>
    );
  }

  renderTree() {
    const { items, checkedKeys, expandedKeys } = this.state;

    const checkable = <i/>;
    const switcherIcon = (i) => (!i.isLeaf && <Icon name={`caret ${i.expanded ? 'down' : 'right'}`}/>);

    return (
      <ReactTree
        className="reference-to-list-tree"
        showLine
        checkable={checkable}
        selectable={false}
        switcherIcon={switcherIcon}
        treeData={items}
        checkedKeys={checkedKeys}
        expandedKeys={expandedKeys}
        onCheck={this.handleCheck}
        onExpand={this.handleExpand}
      />
    );
  }

  renderField() {
    return (
      <Form.Field inline={this.props.inline} className="reference-to-list">
        {this.props.name}
        {this.renderTree()}
        {this.renderTreeControl()}
      </Form.Field>
    );
  }

  render() {
    return (this.state.items.length && this.tree) ? this.renderField() : this.renderPlaceholder();
  }
}

const mapStateToProps = (state) => ({
  configs: get(state.app.components, `configs.data_template_field`) || {},
});

export default connect(mapStateToProps)(ReferenceToListTree);
