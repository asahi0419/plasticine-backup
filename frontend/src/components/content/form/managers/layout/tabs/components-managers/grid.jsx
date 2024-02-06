import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Form } from 'semantic-ui-react';
import { isNaN, isEqual } from 'lodash/lang';
import { find, map, reduce } from 'lodash/collection';
import { values } from 'lodash/object';

import DoubleSidedSelect from '../../../../../../shared/selectable/double-sided-select';
import ObjectEditor from '../../../../../../shared/object-editor';
import Dropdown from '../../../../../../shared/inputs/dropdown';

import PlasticineApi from '../../../../../../../api';

const ADDITIONAL_COMPONENTS = [
  { text: '<-- Split -->', value: '__split__', color: '#b6f7f4', uniqueValue: true },
];

export default class GridComponentsManager extends Component {
  static propTypes = {
    record: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.state = { loading: true, fields: [] };
  }

  async componentDidMount() {
    await this.setContent(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    if (!isEqual(this.state.model, nextProps.record.model)) {
      await this.setContent(nextProps);
    }
  }

  setContent = async (props) => {
    this.setState({ loading: true });

    const result = await PlasticineApi.loadFields(props.record.model);
    const fields = result.data.data;

    this.setState({ loading: false, model: props.record.model, ...this.fillState({ fields, record: props.record }) });
  }

  fillState = (props) => {
    const { fields, record } = props;
    const { columns, columns_options, sort_order } = record.options;

    const allFields = fields.map((field) => ({ text: field.name, value: field.alias }));
    const availableFields = allFields
      .filter((field) => !columns.includes(field.value)).sort((a, b) => a.value > b.value)
      .concat(ADDITIONAL_COMPONENTS);

    const selectedFields = reduce(columns, (acc, column) => {
      const field = find(allFields, filed => filed.value === column);
      if (field) {
        acc.push(field);
        return acc;
      }

      const additionalComponent = find(ADDITIONAL_COMPONENTS, component => this.checkAdditionalValue(column, component.value));
      if (additionalComponent) acc.push({ ...additionalComponent, value: column });

      return acc;
    }, []);

    selectedFields.sort((a, b) => columns.indexOf(a.value) - columns.indexOf(b.value));

    const selectedFieldsOptions = columns_options || {};
    const sorting = sort_order.filter((order) => columns.includes(order.field));

    return { allFields, availableFields, selectedFields, selectedFieldsOptions, sorting };
  }

  checkAdditionalValue = (column, componentValue) => {
    const regexp = new RegExp(`^${componentValue}.*`);

    return regexp.test(column);
  };

  handleGroupByChanged = (e, { value }) => {
    this.props.onChange({ options: { ...this.props.record.options, group_by: value } })
  }

  handleWrapTextChanged = (e, { checked }) => {
    this.props.onChange({ options: { ...this.props.record.options, wrap_text: checked } })
  }

  handleNoWrapTextLimitChanged = (e, { value }) => {
    if (isNaN(+value)) return;
    this.props.onChange({ options: { ...this.props.record.options, no_wrap_text_limit: value } })
  }

  handleColumnsChanged = (fields) => {
    const { allFields, sorting } = this.state;
    const { record, onChange } = this.props;
    let { activeSelectedItem } = this.state;

    if (activeSelectedItem && !fields.filter((field) => field.value === activeSelectedItem.value).length) {
      activeSelectedItem = null;
    }

    const selectedFieldsAliases = fields.map((f) => f.value);
    const fieldsInSorting = sorting.map((s) => s.field);

    const newSorting = sorting.filter((s) => selectedFieldsAliases.includes(s.field));
    selectedFieldsAliases.filter((f) => !fieldsInSorting.includes(f)).forEach((field) => {
      newSorting.push({ field, type: 'none' });
    });

    const newAvailableFields = allFields
      .filter((f) => !selectedFieldsAliases.includes(f.value))
      .concat(ADDITIONAL_COMPONENTS);
    const newGroupBy = find(fields, (field) => field.value === record.options.group_by) ? record.options.group_by : null;

    this.setState({
      availableFields: newAvailableFields,
      selectedFields: fields,
      sorting: newSorting,
      activeSelectedItem
    }, onChange({options: {
        ...record.options,
        group_by: newGroupBy,
        columns: fields.map((f) => f.value),
        sort_order: newSorting
      }
    }));
  };

  handleItemOptionsChanged = (data) => {
    const { record, onChange } = this.props;
    const { activeSelectedItem: activeItem, selectedFieldsOptions } = this.state;
    const newFieldsOptions = Object.assign({}, selectedFieldsOptions, { [activeItem.value] : data });
    this.setState({ selectedFieldsOptions: newFieldsOptions },
      onChange({ options: { ...record.options, columns_options: newFieldsOptions } }));
  }

  handleSelectedItemClicked = (item) => {
    this.setState({ activeSelectedItem: item });
  }

  renderDetailsEditor() {
    const { activeSelectedItem } = this.state;
    if (!activeSelectedItem) return;

    const selectedFieldsOptions = this.props.record.options.columns_options || {};
    const data = selectedFieldsOptions[activeSelectedItem.value];

    return (
      <ObjectEditor data={data} onChange={this.handleItemOptionsChanged}>
        <ObjectEditor.Input
          name="name"
          label={i18n.t('display', { defaultValue: 'Display' })}
          as="text"
        />
      </ObjectEditor>
    );
  }

  renderComponentsManager() {
    const { availableFields, selectedFields } = this.state;

    return (
      <DoubleSidedSelect
        leftSideLabel={i18n.t('available_fields', { defaultValue: 'Available fields' })}
        rightSideLabel={i18n.t('selected_fields', { defaultValue: 'Selected fields' })}
        items={availableFields}
        selected={selectedFields}
        onChange={this.handleColumnsChanged}
        onClickSelectedItem={this.handleSelectedItemClicked}
      />
    );
  }

  renderFieldGrouBy() {
    return <div style={{ margin: '20px 0' }}></div>;

    // https://redmine.nasctech.com/issues/51621#note-2
    //
    // const { record: { options } } = this.props;
    // const { selectedFields } = this.state;
    //
    // const field = find(selectedFields, { value: options.group_by });
    // const value = field ? options.group_by : null;
    //
    // return (
    //   <Form.Field style={{ margin: '20px 0' }}>
    //     <label style={{ display: 'block', marginBottom: '.28rem' }}>{i18n.t('group_by', { defaultValue: 'Group by' })}</label>
    //     <Dropdown
    //       options={selectedFields}
    //       value={value}
    //       onChange={this.handleGroupByChanged}
    //       selection
    //     />
    //   </Form.Field>
    // );
  }

  renderFieldWrapText() {
    const { record: { options } } = this.props;

    return (
      <Form.Checkbox
        label={i18n.t('wrap_text', { defaultValue: 'Wrap text' })}
        checked={!!options.wrap_text}
        onChange={this.handleWrapTextChanged}
      />
    );
  }

  renderFieldNoWrap() {
    const { record: { options } } = this.props;

    return (
      <Form.Input
        label={i18n.t('no_wrap_text_limit', { defaultValue: 'No wrap text limit' })}
        value={options.no_wrap_text_limit}
        onChange={this.handleNoWrapTextLimitChanged}
      />
    );
  }

  render() {
    if (this.state.loading) return null;

    return (
      <Grid.Row columns={2}>
        <Grid.Column>
          {this.renderComponentsManager()}
          {this.renderFieldGrouBy()}
          {this.renderFieldWrapText()}
          {this.renderFieldNoWrap()}
        </Grid.Column>
        <Grid.Column>
          {this.renderDetailsEditor()}
        </Grid.Column>
      </Grid.Row>
    );
  }
}
