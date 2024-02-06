import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';

import DoubleSidedSelect from '../../../../../shared/selectable/double-sided-select';
import ObjectEditor from '../../../../../shared/object-editor';

const ADDITIONAL_COMPONENTS = [
  { text: 'Group', value: '__group__', color: '#e6b8ad', uniqueValue: true },
  { text: 'Open view', value: '__view__', color: '#c9dafb', uniqueValue: true },
  { text: 'Open dashboard', value: '__dashboard__', color: '#c9dafb', uniqueValue: true },
  { text: 'Open page', value: '__page__', color: '#c9dafb', uniqueValue: true },
  { text: 'Record new', value: '__record_new__', color: '#daead1', uniqueValue: true },
  { text: 'Record show', value: '__record_show__', color: '#daead1', uniqueValue: true },
  { text: 'Run action', value: '__action__', color: '#d0e0e4', uniqueValue: true },
  { text: 'Open URL', value: '__url__', color: '#fff2c7', uniqueValue: true },
];

const REFERENCE_CONFIG = {
  label: 'name',
  view: 'default',
};

export default class ComponentsManager extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = this.fillState(props);
  }

  componentWillReceiveProps(nextProps) {
    const state = this.fillState(nextProps);
    this.setState(state);
  }

  fillState = (props) => {
    const { components: { list }, sort_order } = props.record.options;

    const availableComponents = ADDITIONAL_COMPONENTS;
    const sorting = sort_order.filter((order) => list.includes(order.field));

    const selectedComponents = list.filter(c => c.substring(0,2) === '__')
      .map((component) => {
        const componentName = component.split('.')[0];
        const additionalComponent = ADDITIONAL_COMPONENTS.find(ac => ac.value === componentName);
        return Object.assign({}, additionalComponent, { value: component });
      })
      .sort((a, b) => list.indexOf(a.value) - list.indexOf(b.value));


    return { availableComponents, selectedComponents, sorting };
  }

  handleChange = (options) => this.props.onChange({ options: { ...this.props.record.options, ...options } })

  handleComponentsChanged = (components) => {
    const { activeSelectedItem, sorting } = this.state;

    const newComponents = { ...this.props.record.options.components, list: components.map(({ value }) => value) };

    if (activeSelectedItem && !components.filter((c) => c.value === activeSelectedItem.value).length) {
      this.setState({ activeSelectedItem: null });
    }

    this.setState({ sorting }, this.handleChange({ components: newComponents, sort_order: sorting }));
  }

  handleSelectedComponentClicked = (item) => this.setState({ activeSelectedItem: item });

  handleComponentOptionsChanged = (data) => {
    const { components } = this.props.record.options;
    const { activeSelectedItem: { value: componentAlias } } = this.state;

    const newComponentOptions = { ...components.options[componentAlias], ...data };
    const options = { ...components.options, [componentAlias]: newComponentOptions };

    this.handleChange({ components: { ...this.props.record.options.components, options } });
  };

  renderIconInput = () => <ObjectEditor.Input name="icon" label="Icon" as="fa-icon"/>

  renderGroupEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" />
      </ObjectEditor>
    );
  }

  renderViewEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const modelParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'model' } };
    const viewParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'view', filter: `model = ${data.model}` } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="model" label="Model" as="reference" params={modelParams} required={true} />
        <ObjectEditor.Input name="view" label="View" as="reference" params={viewParams} disabled={!data.model} required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderDashboardEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const dashboardParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'dashboard' } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="dashboard" label="Dashboard" as="reference" params={dashboardParams} required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderPageEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const pageParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'page' } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="page" label="Page" as="reference" params={pageParams} required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderRecordNewEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const modelParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'model' } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="model" label="Model" as="reference" params={modelParams} required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderRecordShowEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const modelParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'model' } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="model" label="Model" as="reference" params={modelParams} required={true} />
        <ObjectEditor.Input name="record_id" label="Record ID" as="text" required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderActionEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || {};
    const actionParams = { config: { ...REFERENCE_CONFIG, foreignModel: 'action', filter: "`type` = 'user_sidebar'" } };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="action" label="Action" as="reference" params={actionParams} required={true} />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderUrlEditor = (alias) => {
    const data = this.props.record.options.components.options[alias] || { open_in_new_tab: false };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" required={true} />
        <ObjectEditor.Input name="url" label="Url" as="text" required={true} />
        <ObjectEditor.Input name="open_in_new_tab" label="Open in new tab" as="checkbox" />
        {this.renderIconInput()}
      </ObjectEditor>
    );
  }

  renderDetailsEditor(alias) {
    if (alias.startsWith('__group__')) return this.renderGroupEditor(alias);
    if (alias.startsWith('__view__')) return this.renderViewEditor(alias);
    if (alias.startsWith('__dashboard__')) return this.renderDashboardEditor(alias);
    if (alias.startsWith('__page__')) return this.renderPageEditor(alias);
    if (alias.startsWith('__record_new__')) return this.renderRecordNewEditor(alias);
    if (alias.startsWith('__record_show__')) return this.renderRecordShowEditor(alias);
    if (alias.startsWith('__action__')) return this.renderActionEditor(alias);
    if (alias.startsWith('__url__')) return this.renderUrlEditor(alias);

    return this.renderFieldEditor(alias);
  }

  render() {
    const { availableComponents, selectedComponents, activeSelectedItem } = this.state;

    return (
      <Grid.Row columns={2}>
        <Grid.Column>
          <DoubleSidedSelect
            leftSideLabel="Components"
            rightSideLabel="Selected"
            items={availableComponents}
            selected={selectedComponents}
            onChange={this.handleComponentsChanged}
            onClickSelectedItem={this.handleSelectedComponentClicked}
          />
        </Grid.Column>
        <Grid.Column>{activeSelectedItem && this.renderDetailsEditor(activeSelectedItem.value)}</Grid.Column>
      </Grid.Row>
    );
  }
}
