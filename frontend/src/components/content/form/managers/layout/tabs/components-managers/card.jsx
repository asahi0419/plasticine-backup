import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid } from 'semantic-ui-react';
import { uniq } from 'lodash/array';
import { pick } from 'lodash/object';
import { isEqual } from 'lodash/lang';
import { keyBy, find, findLast, map, filter } from 'lodash/collection';

import DoubleSidedSelect from '../../../../../../shared/selectable/double-sided-select';
import ObjectEditor from '../../../../../../shared/object-editor';

import PlasticineApi from '../../../../../../../api';
import { parseOptions, getModel } from '../../../../../../../helpers';

const ADDITIONAL_COMPONENTS = [
  { text: '# Section #', value: '__section__', color: '#d9f6db', uniqueValue: true },
  { text: '= Column =', value: '__column__', color: '#dbd8ff', uniqueValue: true },
  { text: '< Text >', value: '__text__', color: '#ffd9d8', uniqueValue: true },
  { text: '! Action !', value: '__action__', color: '#ffe598', uniqueValue: true },
  { text: '* Thumbnail *', value: '__thumbnail__', color: '#fcfdde' },
  { text: '* Attachment viewer *', value: '__attachment_viewer__', color: '#fcfdde', model: 'attachment' },
];

const ACTION_TYPES = [
  { text: 'Button', value: 'button' },
  { text: 'Link', value: 'link' }
];

const ALIGN_OPTIONS = [
  { text: 'Left', value: 'left' },
  { text: 'Center', value: 'center' },
  { text: 'Right', value: 'right' }
];

const ACTION_REFERENCE_CONFIG = {
  foreignModel: 'action',
  label: 'name',
  view: 'default',
};

export default class CardComponentsManager extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  static defaultProps = {};

  constructor(props) {
    super(props);

    this.state = { loading: true, fields: [] };
  }

  async componentDidMount() {
    await this.setContent(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (!isEqual((this.state.model || {}).id, nextProps.record.model)) {
      await this.setContent(nextProps);
    } else {
      this.setState(this.fillState({ record: nextProps.record }));
    }
  }

  setContent = async (props) => {
    this.setState({ loading: true });

    const result = await PlasticineApi.loadFields(props.record.model);
    const fields = result.data.data;

    let model = getModel(props.record.model);
    if (!model) {
      const result = await PlasticineApi.fetchRecord('model', props.record.model);
      model = (result.data.data[0] || {}).attributes;
    }

    const referenceFields = filter(fields, { type: 'reference' });
    const foreignModels = map(referenceFields, ({ options }) => getModel(parseOptions(options).foreign_model));

    this.setState({ model, fields, foreignModels });
    this.setState({ loading: false, ...this.fillState({ record: props.record }) });
  };

  fillState = (props) => {
    const { components = {}, sort_order = [] } = props.record.options;
    const { list = [] } = components;

    const foreignModelsMap = keyBy(this.state.foreignModels, 'alias');
    const { model } = this.state;

    const foreignThumbnails = this.state.fields
      .filter((field) => field.type === 'reference')
      .map((field) => {
        const foreignModel = parseOptions(field.options).foreign_model;
        const model = foreignModelsMap[foreignModel];
        return { text: `* Thumbnail (${model.plural || model.name}) [${field.name}] *`, value: `__thumbnail__.${field.alias}`, color: '#fcfdde' };
      })
      .sort((a, b) => a.value > b.value);

    const allFields = this.state.fields.map((field) => ({ text: field.name, value: field.alias }));
    const fieldsComponents = list.filter(c => c.substring(0,2) !== '__');
    const availableComponents = allFields
      .filter(({ value }) => !fieldsComponents.includes(value))
      .sort((a, b) => a.value > b.value)
      .concat(ADDITIONAL_COMPONENTS.filter(({ model: componentModel }) => !componentModel || componentModel === model.alias))
      .concat(foreignThumbnails);
    const sorting = sort_order.filter((order) => list.includes(order.field));

    const selectedComponents = list.filter(c => c.substring(0,2) === '__')
      .map((component) => {
        const [componentName, componentId] = component.split('.');
        const targetComponent = ((componentName === '__thumbnail__') && componentId)
          ? foreignThumbnails.find(ft => ft.value === component)
          : ADDITIONAL_COMPONENTS.find(ac => ac.value === componentName);

        return Object.assign({}, targetComponent, { value: component });
      })
      .concat(allFields.filter((f) => fieldsComponents.includes(f.value)))
      .sort((a, b) => list.indexOf(a.value) - list.indexOf(b.value));


    return { availableComponents, selectedComponents, sorting };
  }

  handleChange = (options) => this.props.onChange({ options: { ...this.props.record.options, ...options } })

  handleComponentsChanged = (components) => {
    const { options } = this.props.record;
    const { activeSelectedItem, sorting } = this.state;

    if (activeSelectedItem && !components.filter((c) => c.value === activeSelectedItem.value).length) {
      this.setState({ activeSelectedItem: null });
    }

    const selectedComponentsAliases = components.map(({ value }) => value);
    const selectedComponentsAliasesFiltered = selectedComponentsAliases.filter((value) => value.substring(0, 2) !== '__');
    const fieldsInSorting = sorting.map((s) => s.field);

    const newSorting = sorting.filter((s) => selectedComponentsAliasesFiltered.includes(s.field));
    selectedComponentsAliasesFiltered.filter((f) => !fieldsInSorting.includes(f)).forEach((field) => {
      newSorting.push({ field, type: 'none' });
    });

    const oldThumbnail = find(components, (c) => c.value.startsWith('__thumbnail__'));
    const newThumbnail = findLast(components, (c) => c.value.startsWith('__thumbnail__'));
    if (oldThumbnail && newThumbnail && !isEqual(oldThumbnail, newThumbnail)) {
      const oldThumbnailIndex = selectedComponentsAliases.indexOf(oldThumbnail.value);
      const newThumbnailIndex = selectedComponentsAliases.indexOf(newThumbnail.value);
      selectedComponentsAliases[oldThumbnailIndex] = newThumbnail.value;
      selectedComponentsAliases.splice(newThumbnailIndex, 1);
    }

    this.setState({ sorting: newSorting }, this.handleChange({
      components: {
        ...options.components,
        options: selectedComponentsAliases.length ? pick(options.components.options, selectedComponentsAliases) : {},
        list: uniq(selectedComponentsAliases)
      },
      sort_order: newSorting
    }));
  }

  handleSelectedComponentClicked = (item) => this.setState({ activeSelectedItem: item });

  handleComponentOptionsChanged = (data) => {
    const { components } = this.props.record.options;
    const { activeSelectedItem: { value: componentAlias } } = this.state;

    const newComponentOptions = { ...components.options[componentAlias], ...data };
    const options = { ...components.options, [componentAlias]: newComponentOptions };

    this.handleChange({ components: { ...this.props.record.options.components, options } });
  };

  renderOverridingInputs = (compact = false) => {
    const inputs = [
      <ObjectEditor.Input key="font_size" name="font_size" label="Font size (em)" as="text" />,
      <ObjectEditor.Input key="color" name="color" label="Color" as="colorpicker" />,
      <ObjectEditor.Input key="padding" name="padding" label="Padding" as="text" />,
      <ObjectEditor.Input key="border" name="border" label="Border" as="checkbox" />,
      <ObjectEditor.Input key="border_width" name="border_width" label="Border width (px)" as="text" />,
      <ObjectEditor.Input key="border_color" name="border_color" label="Border color" as="colorpicker" />,
      <ObjectEditor.Input key="background_color" name="background_color" label="Background color" as="colorpicker" />,
    ];

    return compact ? inputs.slice(3) : inputs;
  }

  renderActionInputs = (compact = false) => {
    const { record: { model } } = this.props;
    const actionReferenceConfig = { ...ACTION_REFERENCE_CONFIG, filter: `\`model\` = '${model}' AND \`type\` = 'card_view'` }
    const inputs = [
      <ObjectEditor.Input key="action" name="action" label="Action" as="reference" params={{ config: actionReferenceConfig }} />,
      <ObjectEditor.Input key="suppress_click" name="suppress_click" label="Suppress click" as="checkbox" />,
    ];

    return compact ? inputs.slice(0, 1) : inputs;
  }

  renderSectionEditor = (alias) => {
    const { record: { options } } = this.props;
    const data = options.components.options[alias] || {};

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="name" label="Name" as="text" />
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs()}
      </ObjectEditor>
    );
  }

  renderColumnEditor = (alias) => {
    const { record: { options } } = this.props;
    const data = options.components.options[alias] || { align: 'left' };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="min_width" label="Min width" as="text" />
        <ObjectEditor.Input name="align" label="Align" as="dropdown" params={{ options: ALIGN_OPTIONS }} />
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs()}
      </ObjectEditor>
    );
  }

  renderTextEditor = (alias) => {
    const { record: { options } } = this.props;
    const data = options.components.options[alias] || {};

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="text" label="Text" as="text" />
        <ObjectEditor.Input name="rowspan" label="Rowspan" as="text" />
        {this.renderActionInputs(true)}
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs()}
      </ObjectEditor>
    );
  }

  renderActionEditor = (alias) => {
    const { record: { options, model } } = this.props;
    const data = options.components.options[alias] || { type: 'button' };
    const actionReferenceConfig = { ...ACTION_REFERENCE_CONFIG, filter: `\`model\` = '${model}' AND \`type\` = 'card_view'` }

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="type" label="Type" as="dropdown" params={{ options: ACTION_TYPES }} />
        <ObjectEditor.Input name="action" label="Action" as="reference" params={{ config: actionReferenceConfig }} />
        <ObjectEditor.Input name="rowspan" label="Rowspan" as="text" />
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs(true)}
      </ObjectEditor>
    );
  }

  renderThumbnailEditor = (alias) => {
    const { record: { options } } = this.props;
    const data = options.components.options[alias] || {};

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="max_width" label="Width max (px)" as="text" />
        <ObjectEditor.Input name="max_height" label="Height max (px)" as="text" />
        <ObjectEditor.Input name="rowspan" label="Rowspan" as="text" />
        {this.renderActionInputs()}
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs(true)}
      </ObjectEditor>
    );
  }

  renderFieldEditor = (alias) => {
    const { record: { options } } = this.props;
    const field = this.state.fields.find((f) => f.alias === alias);
    const data = options.components.options[alias] || { label: field.name, max_length: 255 };

    return (
      <ObjectEditor data={data} onChange={this.handleComponentOptionsChanged}>
        <ObjectEditor.Input name="label" label="Label" as="text" />
        <ObjectEditor.Input name="align" label="Align" as="dropdown" params={{ options: ALIGN_OPTIONS }} />
        <ObjectEditor.Input name="max_length" label="Text length max" as="text" />
        <ObjectEditor.Input name="rowspan" label="Rowspan" as="text" />
        <ObjectEditor.Input name="show_label" label="Show label" as="checkbox" />
        {this.renderActionInputs(field.type !== 'reference')}
        <ObjectEditor.Input name="override_styles" label="Override styles" as="checkbox" />
        {data.override_styles && this.renderOverridingInputs()}
      </ObjectEditor>
    );
  }

  renderComponentsManager() {
    const { availableComponents, selectedComponents } = this.state;

    return (
      <DoubleSidedSelect
        leftSideLabel="Components"
        rightSideLabel="Selected"
        items={availableComponents}
        selected={selectedComponents}
        onChange={this.handleComponentsChanged}
        onClickSelectedItem={this.handleSelectedComponentClicked}
      />
    );
  }

  renderDetailsEditor() {
    const { activeSelectedItem: item } = this.state;
    if (!item) return;

    if (item.value.startsWith('__section__')) return this.renderSectionEditor(item.value);
    if (item.value.startsWith('__column__')) return this.renderColumnEditor(item.value);
    if (item.value.startsWith('__text__')) return this.renderTextEditor(item.value);
    if (item.value.startsWith('__action__')) return this.renderActionEditor(item.value);
    if (item.value.startsWith('__thumbnail__') || item.value.startsWith('__attachment_viewer__')) return this.renderThumbnailEditor(item.value);

    return this.renderFieldEditor(item.value);
  }

  render() {
    if (this.state.loading) return null;

    return (
      <Grid.Row columns={2}>
        <Grid.Column>
          {this.renderComponentsManager()}
        </Grid.Column>
        <Grid.Column>
          {this.renderDetailsEditor()}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
