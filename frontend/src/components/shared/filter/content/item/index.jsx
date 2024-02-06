import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button } from 'semantic-ui-react'

import FieldSelector from './field-selector';
import OperatorSelector from './operator-selector';
import ValueInput from './value';

import * as CONSTANTS from '../../../../../constants';
import * as HELPERS from '../../../../../helpers';
import * as OPERATORS from '../../operators';

const FilterItemStyled = styled.div`
  display: flex;
  margin-bottom: 10px;

  &:last-child {
    margin-bottom: 0;
  }

  .filter-item-label {
    min-width: 25px;
    margin-right: 10px;
    line-height: 32px;
    text-align: right;
  }

  .filter-item-controls {
    display: flex;
    justify-content: space-between;
    flex: 1;
  }

  .filter-item-inputs {
    display: flex;
    flex: 1;
    margin-right: 10px;

    > div {
      margin-right: 10px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .filter-item-inputs.compact .ui.input {
    min-width: 140px;
    width: 140px;
  }

  .filter-item-value-wrapper {
    width: 100%;

    > div {
      margin-right: 5px;

      &:first-child {
        margin-right: 0;
      }
    }
  }

  .filter-item-value-control {
    display: flex;
    flex: 1;
    align-items: center;

    > div {
      display: flex;
      flex: 1;
    }

    > .button {
      margin: 0 0 0 5px;
    }

    &:nth-child(2) {
      margin-left: 10px;
    }
  }

  .filter-item-value-wrapper .ui.input,
  .filter-item-value-wrapper .ui.dropdown {
    width: 100%;
    min-width: 200px;
  }

  .filter-item-value-wrapper.compact .ui.input,
  .filter-item-value-wrapper.compact .ui.dropdown {
    min-width: 140px;
  }

  .filter-item-actions {
    width: 142px;
    text-align: right;

    .button {
      width: 45px;

      &:last-child {
        margin-right: 0;
      }
    }
  }

  @media only screen and (max-width: ${CONSTANTS.UI_TABLET_MAX_SIZE}px) {
    .filter-item-controls {
      flex-direction: column;
    }

    .filter-item-inputs {
      flex-direction: column;
      margin-right: 0;

      > div {
        margin-right: 0;
        margin-bottom: 10px;
      }
    }

    .filter-item-actions {
      text-align: left;
    }
  }
`;

export default class FilterItem extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    model: PropTypes.object.isRequired,
    field: PropTypes.object.isRequired,
    operator: PropTypes.string.isRequired,
    value: PropTypes.any,
    type: PropTypes.string.isRequired,
    availableFields: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    compact: PropTypes.bool.isRequired,
    onAdd: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onDestroy: PropTypes.func.isRequired,
    templates: PropTypes.array.isRequired,
    loadTemplateFields: PropTypes.func.isRequired,
    loadReferenceFields: PropTypes.func.isRequired,
  }

  shouldComponentUpdate(nextProps) {
    if (this.props.field.id === nextProps.field.id &&
        this.props.field.alias === nextProps.field.alias &&
        this.props.operator === nextProps.operator &&
        this.props.value === nextProps.value &&
        this.props.type === nextProps.type &&
        this.props.availableFields.length === nextProps.availableFields.length) return false;

    return true;
  }

  onFieldChanged = (_, { value: fieldAlias }) => {
    const { id, onChange } = this.props;
    const field = this.props.availableFields.find((f) => f.alias === fieldAlias);
    const operator = Object.keys(this.getOperators(field))[0];
    onChange({ field, operator, value: null }, id);
  };

  onOperatorChanged = (_, { value: operator }) => {
    const { id, field, value, onChange } = this.props;
    const valueForChange = ['reference', 'datetime'].includes(field.type) ? null : value;

    onChange({ field, operator, value: valueForChange }, id);
  };

  onValueChanged = (_, { value }) => {
    const { id, field, operator, onChange } = this.props;
    onChange({ field, operator, value }, id);
  };

  handleAdding = (type) => this.props.onAdd(type, this.props.id);
  handleRemove = () => this.props.onDestroy(this.props.id);

  getOperators = (field) => {
    const { isCondition } = this.props;
    let operators = OPERATORS.getOperators(field.type);

    if (!isCondition && field.type === 'array_string') {
      const { multi_select } = HELPERS.parseOptions(field.options);
      if (multi_select) return OPERATORS.getOperators('array_string_multi_select');
    }

    if (field.type !== 'reference') return operators;

    if (isCondition) operators = OPERATORS.getOperators('reference_for_condition');

    const { foreign_model } = HELPERS.parseOptions(field.options);
    if (foreign_model === 'user' || (isCondition && foreign_model === 'user_group')) {
      return { ...operators, ...OPERATORS.getOperators(foreign_model) };
    }
    return operators;
  }

  renderFieldSelector() {
    const { field, templates, availableFields, loadTemplateFields, loadReferenceFields, index } = this.props;

    return (
      <FieldSelector
        fields={availableFields}
        selected={field}
        templates={templates}
        loadTemplateFields={loadTemplateFields}
        loadReferenceFields={loadReferenceFields}
        onChange={this.onFieldChanged}
        upward={index >= 5}
      />
    );
  }

  renderOperatorSelector() {
    const { field, operator, index } = this.props;

    const hidden = ['true_stub', 'boolean_stub'].includes(field.type) || !field.type;
    const operators = this.getOperators(field)

    return (
      <OperatorSelector
        hidden={hidden}
        selected={operator}
        operators={operators}
        onChange={this.onOperatorChanged}
        upward={index >= 5}
      />
    );
  }

  renderValueInput() {
    const { model, field, operator, value, compact } = this.props;
    if (field.type === 'boolean_stub' || !field.alias.length) return

    return (
      <ValueInput
        model={model}
        field={field}
        operator={operator}
        value={value}
        compact={compact}
        onChange={this.onValueChanged}
      />
    );
  }

  renderLabel() {
    const { type, index } = this.props;

    return (
      <div className="filter-item-label">
        {index > 0 ? type : ''}
      </div>
    );
  }

  renderInputs() {
    const classNames = ['filter-item-inputs'];
    if (this.props.compact) classNames.push('compact');

    return (
      <div className={classNames.join(' ')}>
        {this.renderFieldSelector()}
        {this.renderOperatorSelector()}
        {this.renderValueInput()}
      </div>
    );
  }

  renderActions() {
    const { type } = this.props;

    return (
      <div className="filter-item-actions">
        {type === 'and' ? <Button basic onClick={this.handleAdding.bind(this, 'and')}>{i18n.t('and', { defaultValue: 'And' })}</Button> : ''}
        {type === 'and' ? <Button basic onClick={this.handleAdding.bind(this, 'or')}>{i18n.t('or', { defaultValue: 'Or' })}</Button> : ''}

        <Button icon="remove" color="red" onClick={this.handleRemove}/>
      </div>
    );
  }

  renderControls() {
    return (
      <div className="filter-item-controls">
        {this.renderInputs()}
        {this.renderActions()}
      </div>
    );
  }

  render() {
    return (
      <FilterItemStyled className="filter-item">
        {this.renderLabel()}
        {this.renderControls()}
      </FilterItemStyled>
    );
  }
}
