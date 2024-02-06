import React from 'react';
import PropTypes from 'prop-types';
import { find, reduce, filter, map, each, some, sortBy } from 'lodash/collection';
import { omit, assign, pick, has, get } from 'lodash/object';
import { isEmpty, isEqual, isArray, cloneDeep } from 'lodash/lang';
import { findIndex } from 'lodash/array';
import { Form, Segment, Icon, Divider, Grid } from 'semantic-ui-react';
import PubSub from 'pubsub-js';

import PlasticineApi from '../../../../../../api';
import { parseOptions } from '../../../../../../helpers';
import BaseField from '../base';
import Tree from './tree';
import Details from './details';
import { PRIMARY_ALIASES, DETAILS_ALIASES, TEMPLATES } from './constants';
import Sandbox from '../../../../../../sandbox';
import ProxyRecord from '../../../../../../containers/content/form/proxy-record';

export default class DataTemplateField extends BaseField {
  static propTypes = {
    ...BaseField.propTypes,
    configs: PropTypes.object,
    fields: PropTypes.array.isRequired,
    uiRules: PropTypes.array.isRequired,
    createItem: PropTypes.func.isRequired,
    updateItem: PropTypes.func.isRequired,
    deleteItem: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {
    configs: { templates: [], options: {} },
  }

  static contextTypes = {
    sandbox: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { items: [], selected: {} };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillUpdate(nextProps, nextState) {
    if (!isEqual(this.state.selected, nextState.selected)) {
      this.setRecord(nextState.selected);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { changeableProps } = this.constructor;
    const changeableState = ['templates', 'items', 'selected'];

    return !isEqual(
      pick(this.props, changeableProps),
      pick(nextProps, changeableProps),
    ) || !isEqual(
      pick(this.state, changeableState),
      pick(nextState, changeableState),
    );
  }

  setContent = async (props) => {
    this.options = parseOptions(props.field.options);
    this.configs = props.configs;

    this.setFields(props);
    this.setTemplates();
    this.setItems(props);
  }

  compileFilter = (filter) => {
    const sourceFields = (filter.match(/\{\w+\}/g) || []).map(part => part.slice(1, -1));

    each(sourceFields, (sourceField) => {
      const sourceValue = this.props.getRecordValue(sourceField);
      const replaceWithValue = isArray(sourceValue)
        ? sourceValue.length && sourceValue.join(',')
        : sourceValue;

      filter = filter.replace(`{${sourceField}}`, replaceWithValue || null);
    });

    return filter;
  };

  setFields = async (props) => {
    this.fields = {
      primary: filter(props.fields, ({ alias }) => PRIMARY_ALIASES.includes(alias)),
      details: filter(props.fields, ({ alias }) => DETAILS_ALIASES.includes(alias)),
      tree: filter(props.fields, ({ alias }) => ![...PRIMARY_ALIASES, ...DETAILS_ALIASES].includes(alias)),
    };
  }

  setTemplates = () => {
    const { templates = [] } = this.configs;
    const availableTemplates = filter(
      [...TEMPLATES, ...templates],
      ({ key, hidden_when_script }) =>
        !(this.options.hidden_fields || []).includes(key) &&
        !(hidden_when_script && this.context.sandbox.executeScript(hidden_when_script, {}, `field/${key}/hidden_when_script`)),
    );

    this.templates = availableTemplates.map((template) => {
      const options = cloneDeep(template.options);
      each(options, ({ options }) => options.filter && (options.filter = this.compileFilter(options.filter)));

      return {
        ...template,
        options,
        title: i18n.t(template.key),
        className: 'template-button',
        template: true,
        icon: <Icon name={template.icon} />,
      };
    });
  }

  setItems = (props) => {
    const { attr: attributes } = parseOptions(props.value);

    if (isEmpty(attributes)) return this.setState({ templates: this.templates, items: [], selected: {} });

    const tree = filter(attributes, ({ f }) => find(this.fields.tree, { id: f }));
    const parentItems = filter(tree, ({ p }) => p === -1);
    const items = map(parentItems, item => this.generateItem(item, tree));
    const selected = isEmpty(this.state.selected) ? items[0] : this.state.selected;

    this.setState({ templates: this.templates, items, selected });
  }

  setRecord = (selected) => {
    if (isEmpty(selected)) return;

    const metadata = {
      model: { alias: 'field' },
      fields: [...this.fields.primary, ...this.fields.details],
      inserted: true, // do not trigger ui rules for not inserted records
    };
    const record = new ProxyRecord(selected, metadata, this.configs);
    const sandbox = new Sandbox({ record });

    record.__assignSandbox(sandbox);
    record.subscribe(() => this.forceUpdate());

    sortBy(this.props.uiRules, [({ order }) => parseInt(order, 10)])
      .forEach((rule) => {
        return ['on_load', 'on_change'].includes(rule.type) &&
          sandbox.executeScript(rule.script, {}, `ui_rule/${rule.id}/script`)
      });

    this.record = record;

    return record;
  }

  getItemByField = (field) => {
    const { subtype } = parseOptions(field.options);
    return find([...TEMPLATES, ...(this.configs.templates || [])], { subtype });
  }

  createItem = (item) => this.props.createItem(item, this.setRecord)

  generateItem = (item, tree) => {
    const field = find(this.fields.tree, { id: item.f });
    const children = filter(tree, { p: item.f });
    const { subtype, icon } = this.getItemByField(field) || {};
    const disabled = !find(this.templates, { subtype });

    const props = {
      ...field,
      key: field.alias,
      title: `${field.name} (${subtype})`,
      icon: <Icon name={icon} />,
      parent: item.p,
      subtype,
      disabled,
    };

    if (subtype === 'folder') props.children = isEmpty(children) ? [] : map(children, i => this.generateItem(i, tree));

    return props;
  }

  selectItem = async (dragKey, items, parent = -1) => {
    const isTemplate = map(this.templates, 'subtype').includes(dragKey);
    let result;

    if (isTemplate) {
      this.findItemByKey(this.templates, { key: dragKey }, (item, index, array) => {
        const name = `${item.title} ${this.countItems(this.state.items, item.subtype) + 1}`;
        const title = `${name} (${item.subtype})`;
        result = { ...omit(item, ['template', 'className']), name, title };
      });

      const item = await this.createItem(result);
      assign(result, { ...item, key: item.alias });
    } else {
      this.findItemByKey(items, { key: dragKey }, (item, index, array) => {
        array.splice(index, 1);
        result = item;
      });
    }

    return { ...result, parent };
  }

  convertItem = (item, result) => {
    result.push({ p: item.parent, f: item.id });
    if (!isEmpty(item.children)) each(item.children, i => this.convertItem(i, result));
  };

  processItems = async (items, selected) => {
    const attributes = [];
    each(items, item => this.convertItem(item, attributes));
    this.setState({ items, selected });
    await this.props.onChange(attributes);
  }

  countItems = (items, type, count = 0) => {
    items.forEach((item) => {
      if (item.subtype === type) count += 1;
      if (!isEmpty(item.children)) count = this.countItems(item.children, type, count);
    });

    return count;
  }

  findItemByKey = (items, key, callback, level = 0) => {
    items.forEach((item, index, array) => {
      if (find([item], key)) return callback(item, index, array, level);
      if (!isEmpty(item.children)) this.findItemByKey(item.children, key, callback, level + 1);
    });
  };

  findParentByKey = (items, key, callback) => {
    items.forEach((item, index, array) => {
      if (find((item.children || []), { key })) return callback(item, index, array);
      if (!isEmpty(item.children)) this.findParentByKey(item.children, key, callback);
    });
  };

  validateNestingLevel = (dragKey, dropKey) => {
    let nestable = true;
    this.findItemByKey(this.state.items, { key: dropKey }, (item, index, array, level) => {
      if (dragKey.startsWith('folder') && (level > 1)) {
        nestable = false;
        PubSub.publish('messages', { type: 'info', content: i18n.t('сannot_create_nesting', { defaultValue: 'Cannot create more than 3 levels of nesting' }) });
      }
    })
    return nestable;
  }

  dropTreeItemToPlaceholder = async (dragKey) => {
    const items = [...this.state.items];
    const selected = await this.selectItem(dragKey, items);

    items.push(selected);
    await this.processItems(items, selected);
  };

  dropTreeItemToGap = async (dragKey, dropKey, dropPosition) => {
    const items = [...this.state.items];

    const drop = {};
    this.findItemByKey(items, { key: dropKey }, (item, index, array) => assign(drop, { item, index, array }));
    this.findParentByKey(items, dropKey, item => assign(drop, { parent: item ? item.id : -1 }));

    const selected = await this.selectItem(dragKey, items, drop.parent);
    drop.array.splice(((dropPosition === -1) ? drop.index : (drop.index + 1)), 0, selected);

    await this.processItems(items, selected);
  }

  dropTreeItemToFolder = async (dragKey, dropKey, dropPosition) => {
    const items = [...this.state.items];

    const drop = {};
    this.findItemByKey(items, { key: dropKey }, (item, index, array) => ((item.subtype === 'folder') && assign(drop, { item, index, array })));
    if (!drop.item || drop.item.template) return;

    const selected = await this.selectItem(dragKey, items, drop.item.id);
    drop.item.children = [...drop.item.children, selected];

    await this.processItems(items, selected);
  }

  handleDropTreeItem = async (info) => {
    const dropToGap = info.dropToGap;
    const dragKey = info.dragNode.props.eventKey;
    const dropKey = info.node.props.eventKey;
    const dropPos = info.node.props.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);

    if (!this.validateNestingLevel(dragKey, dropKey)) return;
    if (dropKey === 'placeholder') return this.dropTreeItemToPlaceholder(dragKey);

    const dropTreeItemHandler = dropToGap ? this.dropTreeItemToGap : this.dropTreeItemToFolder;
    await dropTreeItemHandler(dragKey, dropKey, dropPosition);
  }

  handleSelectTreeItem = (keys, info) => {
    this.findItemByKey(this.state.items, { key: info.node.props.eventKey }, (selected) => {
      this.setState({ selected });
    });
  }

  handleChangeItem = (fieldAlias, value) => {
    this.setState({ selected: { ...this.state.selected, [fieldAlias]: value } });
  }

  handleUpdateItem = async () => {
    const items = [...this.state.items];
    const selected = { ...this.state.selected, ...this.record.attributes, title: `${this.record.attributes.name} (${this.state.selected.subtype})` };

    this.findItemByKey(items, { key: selected.key }, item => assign(item, selected));
    this.setState({ items }, this.forceUpdate);

    await this.props.updateItem({ id: this.record.id, ...this.record.attributes });
  }

  handleDeleteItem = async () => {
    const items = [...this.state.items];
    const { selected } = this.state;
    const { id: f, key } = selected;
    const state = { items, selected: {} };
    const attributes = [];

    each(items, item => this.convertItem(item, attributes));

    const nextItem = attributes[findIndex(attributes, { f }) - 1] ||
                     attributes[findIndex(attributes, { f }) + 1] || {};

    this.findItemByKey(items, { id: nextItem.f }, item => (state.selected = item));
    this.findItemByKey(items, { key }, (item, index, array) => array.splice(index, 1));

    this.setState(state);

    await this.props.onChange(filter(attributes, i => i.f !== f));
    await this.props.deleteItem(selected);
  }

  renderContent() {
    const { items = [], selected = {}, record = {} } = this.state;
    const enabled = !!find(this.templates, { subtype: selected.subtype });

    return [
      <Tree
        key="tree"
        items={items}
        templates={this.templates}
        selected={selected}
        onDrop={this.handleDropTreeItem}
        onSelect={this.handleSelectTreeItem}
      />,
      <Details
        key="details"
        enabled={enabled}
        record={this.record}
        hasChildren={selected.children && !!selected.children.length}
        onUpdate={this.handleUpdateItem}
        onDelete={this.handleDeleteItem}
      />
    ]
  }

  renderWrapper() {
    const className = `content${this.props.inline ? ' inline' : ''}`;
    const style = { header: { height: '32px', lineHeight: '32px' }, content: { display: 'flex', marginRight: '-10px' } };
    const header = i18n.t('drag_n_drop_property', { defaultValue: 'Drag & drop property' });

    return (
      <Segment className={className}>
        <div style={style.header}>{header}</div>
        <Divider />
        <div style={style.content}>{this.renderContent()}</div>
      </Segment>
    );
  }

  render() {
    return (
      <div className={`${this.props.inline ? 'inline' : ''} field data-template`}>
        {this.renderLabel()}
        {this.renderWrapper()}
      </div>
    );
  }
}
