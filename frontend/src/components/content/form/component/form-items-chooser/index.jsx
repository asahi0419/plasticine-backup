import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import lodash from 'lodash'

import PlasticineApi from '../../../../../api';
import * as HELPERS from '../../../../../helpers';

import ObjectEditor from '../../../../shared/object-editor';
import DoubleSidedSelect from '../../../../shared/selectable/double-sided-select';
import AttachmentsEditor from './attachments-editor';
import WorklogEditor from './worklog-editor';
import SectionColumnEditor from './section-column-editor';

const ADDITIONAL_COMPONENTS = [
  { text: '^ Tab ^', value: '__tab__', color: '#b3ccb5', uniqueValue: true },
  { text: '# Section #', value: '__section__', color: '#d9f6db', uniqueValue: true },
  { text: '= Column =', value: '__column__', color: '#dbd8ff', uniqueValue: true },
  { text: '< Label >', value: '__label__', color: '#ffd9d8', uniqueValue: true },
  { text: '! Worklog !', value: '__worklog__', color: '#ffe598', uniqueValue: true },
  { text: '* Attachments *', value: '__attachments__', color: '#fcfdde' },
  { text: '* Attachment viewer *', value: '__attachment_viewer__', color: '#fcfdde', model: 'attachment' },
  { text: '% Dashboard %', value: '__dashboard__', color: '#defffe', model: 'dashboard' },
  { text: '% Chart %', value: '__chart__', color: '#68f6fe', model: 'chart' },
  { text: '[ Form items chooser ]', value: '__form_items_chooser__', color: '#00ffff', model: 'form' },
  { text: '[ Related data chooser ]', value: '__related_data_chooser__', color: '#32c3c3', model: 'form' },
];

export default class FormItemsChooser extends Component {
  static propTypes = {
    model: PropTypes.number,
    config: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      active: null,
      items: [],
    };
  }

  componentDidMount() {
    this.setContent(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (lodash.isEqual(nextProps.model, this.props.model)) return
    this.setContent(nextProps);
  }

  setContent = async (props) => {
    if (props.model) {
      const fields = await PlasticineApi.loadFields(props.model, { accessible: true });
  
      this.setState({
        active: null,
        items: fields.data.data,
      })
    } else {
      this.setState({
        active: null,
        items: [],
      })
    }
  }

  handleComponentsChanged = (components) => {
    const { config } = this.props;
    const { active } = this.state;

    if (active && !components.filter((c) => c.value === active.value).length) {
      this.setState({ active: null });
    }

    this.props.onChange({ options: config.options, list: components.map(({ value }) => value) });
  }

  handleSelectedComponentClicked = (item) => {
    this.setState({ active: item })
  }

  handleComponentOptionsChanged = (data) => {
    const { config } = this.props;
    const { active: { value: componentAlias }} = this.state;

    const newComponentOptions = { ...config.options[componentAlias], ...data };
    const options = { ...config.options, [componentAlias] : newComponentOptions };

    this.props.onChange({ options, list: config.list });
  };

  renderSectionEditor = (alias) => {
    const { model, config } = this.props;

    return (
      <SectionColumnEditor model={model} options={config.options[alias] || {}} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="min_width" label="Min width" as="text" />
        <ObjectEditor.Input name="expanded" label="Expanded" as="checkbox" />
      </SectionColumnEditor>
    );
  }

  renderColumnEditor = (alias) => {
    const { model, config } = this.props;

    return (
      <SectionColumnEditor model={model} options={config.options[alias] || {}} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="max_width" label="Max width" as="text" />
      </SectionColumnEditor>
    );
  }

  renderTabEditor = (alias) => {
    const { config } = this.props;
    const data = config.options[alias] || {};

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" />
      </ObjectEditor>
    );
  }

  renderAttachmentsEditor = (alias) => {
    return (
      <AttachmentsEditor
        options={this.props.config.options[alias] || {}}
        onChange={this.handleComponentOptionsChanged}
      />
    );
  }

  renderDashboardEditor = (alias) => {
    return (
      <ObjectEditor data={this.props.config.options[alias] || {}} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" />
      </ObjectEditor>
    );
  }

  renderChartEditor = (alias) => {
    return (
      <ObjectEditor data={this.props.config.options[alias] || {}} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" />
      </ObjectEditor>
    );
  }

  renderWorklogEditor = (alias) => {
    const { config } = this.props;

    return (
      <WorklogEditor
        options={config.options[alias] || {}}
        onChange={this.handleComponentOptionsChanged}
      />
    );
  }

  renderEditor = (alias) => {
    const item = lodash.find(this.state.items, { alias });

    const defaultData = { name: item.name };
    if (item.type === 'reference') lodash.assign(defaultData, { show_add_button: false, show_preview_button: true });

    const data = this.props.config.options[alias] || defaultData;
    const options = [];

    if (item.type === 'reference' || item.type === 'reference_to_list')
      options.push(<ObjectEditor.Input key="show_add_button" name="show_add_button" label="Show add button" as="checkbox" />);
    if (item.type === 'reference')
      options.push(<ObjectEditor.Input key="show_preview_button" name="show_preview_button" label="Show preview button" as="checkbox" />);

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Label" as="text" />
        <ObjectEditor.Input name="placeholder" label="Placeholder" as="text" />
        {options}
      </ObjectEditor>
    );
  }

  renderDetailsEditor() {
    const { active } = this.state;
    if (!active) return;

    const alias = active.value;

    if (alias.startsWith('__tab__') || alias.startsWith('__label__')) return this.renderTabEditor(alias);
    if (alias.startsWith('__section__')) return this.renderSectionEditor(alias);
    if (alias.startsWith('__column__')) return this.renderColumnEditor(alias);
    if (alias.startsWith('__attachments__')) return this.renderAttachmentsEditor(alias);
    if (alias.startsWith('__dashboard__')) return this.renderDashboardEditor(alias);
    if (alias.startsWith('__chart__')) return this.renderChartEditor(alias);
    if (alias.startsWith('__worklog__')) return this.renderWorklogEditor(alias);
    if (alias.substring(0, 2) !== '__') return this.renderEditor(alias);
  }

  render() {
    const { model = {}, config } = this.props;

    const items = this.state.items.map(item => ({ text: item.name, value: item.alias }));
    const components = config.list.filter(c => c.substring(0, 2) !== '__');

    const availableItems = items.length
      ? items
        .filter(({ value }) => !components.includes(value))
        .concat(ADDITIONAL_COMPONENTS.filter((c) => {
          const m = HELPERS.getModel(model)
          return !c.model || c.model === m?.alias
        }))
      : []

    const selected = availableItems.length
      ? config.list.filter(c => c.substring(0, 2) === '__')
        .map((component) => {
          const componentName = component.split('.')[0];
          const additionalComponent = ADDITIONAL_COMPONENTS.find(ac => ac.value === componentName);
          return Object.assign({}, additionalComponent, { value: component });
        })
        .concat(items.filter((f) => components.includes(f.value)))
        .sort((a, b) => config.list.indexOf(a.value) - config.list.indexOf(b.value))
      : []

    return (
      <Grid style={{ margin: '0' }}>
        <Grid.Row columns={2}>
          <Grid.Column>
            <DoubleSidedSelect
              leftSideLabel="Components"
              rightSideLabel="Selected"
              items={availableItems}
              selected={selected}
              onChange={this.handleComponentsChanged}
              onClickSelectedItem={this.handleSelectedComponentClicked}
              showExtraFilter={false}
            />
          </Grid.Column>
          <Grid.Column>{this.renderDetailsEditor()}</Grid.Column>
        </Grid.Row>
      </Grid>
    );
  }
}
