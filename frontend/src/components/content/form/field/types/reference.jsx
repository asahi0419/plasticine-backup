import React from 'react';
import PropTypes from 'prop-types';
import { compact } from 'lodash/array';
import { toString } from 'lodash/lang';

import BaseField from './base';
import Reference from '../../../../shared/inputs/reference';
import { compileFilter } from '../../../../../helpers';

export default class ReferenceField extends BaseField {
  static contextTypes = {
    sandbox: PropTypes.object,
  };

  static propTypes = {
    ...BaseField.propTypes,
    showRecordDetail: PropTypes.bool,
    showReferenceCreator: PropTypes.bool,
    onOpenReferenceCreator: PropTypes.func,
  };

  static defaultProps = {
    inline: true,
    error: false,
    required: false,
    enabled: true,
    getRecordValue: () => null,
    setRecordValue: () => null,
    setRecordVisibleValue: () => null,
    showRecordDetail: true,
    showReferenceCreator: false,
    onOpenReferenceCreator: () => null,
  };

  shouldComponentUpdate = null;

  compileFilter = (options) => {
    const { filter, depends_on_filter } = options;

    const compiler = (query, params) => compileFilter(query, params);

    const queries = [];
    if (filter) {
      const query = compiler(filter, {
        model: this.props.model,
        sandbox: this.context.sandbox,
        preserve_strings: this.options.subtype !== 'option',
        type: this.props.field.type
      });
      
      queries.push(query);
    }

    if (depends_on_filter) {
      const query = compiler(depends_on_filter, {
        model: this.props.model,
        sandbox: this.context.sandbox,
        preserve_strings: true,
        type: this.props.field.type
      });

      queries.push(query);
    }


    return queries.map((query) => `(${query})`).join(' AND ');
  }

  generateConfig = (options, type) => {
    const {
      foreign_model: foreignModel,
      foreign_label: label,
      view,
      form,
      tree,
      extra_fields,
    } = options;

    return {
      hash: window.location.hash,
      foreignModel,
      label,
      view,
      form,
      tree,
      extra_fields,
      filter: this.compileFilter(options),
    };
  };

  getValue = () => this.props.value;

  getOptions = () => {
    const { humanizedValue, isFieldChanged } = this.props;
    const value = this.getValue();
    return (value && humanizedValue && !isFieldChanged) ? [{ value, text: humanizedValue }] : [];
  }

  setValue = (value) => this.props.setRecordValue(this.props.field.alias, value);

  setVisibleValue = (value) => this.props.setRecordVisibleValue(this.props.field.alias, value);

  render() {
    const { humanizedValue, required, enabled, inline, error, value, parent,
            extraAttributes = {}, onOpenReferenceCreator, showRecordDetail,
            showReferenceCreator, field } = this.props;

    const records = value ? [{ id: value, ...(extraAttributes[field.alias] || {}) }] : [];
    const options = this.getOptions();
    const config = this.generateConfig(this.options, field.type);

    return (
      <Reference
        fieldName={field.name}
        config={config}
        parent={parent}
        name={this.renderLabel()}
        value={value}
        humanizedValue={toString(humanizedValue)}
        records={records}
        options={options}
        inline={inline}
        error={error}
        disabled={!enabled}
        required={required}
        onChange={this.onChange}
        setValue={this.setValue}
        setVisibleValue={this.setVisibleValue}
        showRecordDetail={showRecordDetail}
        showReferenceCreator={showReferenceCreator}
        onOpenReferenceCreator={onOpenReferenceCreator}
      />
    );
  }
}
