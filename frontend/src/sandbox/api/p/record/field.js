import { isArray } from 'lodash/lang';
import { pick, omit } from 'lodash/object';
import { flatten, compact } from 'lodash/array';
import { map, each, every } from 'lodash/collection';

import { parseOptions, compileFilter } from '../../../../helpers';

export default class Field {
  constructor(field, recordProxy) {
    this.field = field;
    this.id = field.id;
    this.alias = field.alias;
    this.type = field.type;
    this.model = field.model;
    this.recordProxy = recordProxy;
  }

  getValue() {
    return this.recordProxy.getValue(this.alias);
  }

  getPrevValue() {
    return this.recordProxy.getPrevValue(this.alias);
  }

  getVisibleValue() {
    return this.recordProxy.getVisibleValue(this.alias);
  }

  setValue(newValue) {
    return this.recordProxy.setValue(this.alias, newValue);
  }

  setValueSilent(newValue) {
    return this.recordProxy.setValue(this.alias, newValue, true);
  }

  onChange(func) {
    this.recordProxy.record.bindDynamicOnChangeHandler(this.alias, func);
  }

  setArrayValues(values) {
    if (this.field.type !== 'array_string') return;
    if (!isArray(values)) return;

    const value = this.getValue();
    const options = this.getOptions();
    const shouldClearValue = !(options.multi_select ? every(value, (v) => values.includes(v)) : values.includes(value));

    if (shouldClearValue) this.setValue(null);
    options.values = pick(options.values, values);

    this.recordProxy.record.changeField({ ...this.field, options: JSON.stringify(options) });
  }

  removeArrayValues(values) {
    if (this.field.type !== 'array_string') return;
    if (!isArray(values)) return;

    const value = this.getValue();
    const options = this.getOptions();
    const shouldClearValue = (options.multi_select ? every(value, (v) => values.includes(v)) : values.includes(value));

    if (shouldClearValue) this.setValue(null);
    options.values = omit(options.values, values);

    this.recordProxy.record.changeField({ ...this.field, options: JSON.stringify(options) });
  }

  restoreArrayValues() {
    this.field.type === 'array_string' && this.recordProxy.record.changeField(this.field);
  }

  isRequired() {
    return this.recordProxy.record.isFieldRequired(this.alias);
  }

  isVisible() {
    return this.recordProxy.record.isFieldVisible(this.alias);
  }

  isEnabled() {
    return this.recordProxy.record.isFieldEnabled(this.alias);
  }

  setRequired(state) {
    this.recordProxy.record.setFieldAsRequired(this.alias, state);
  }

  setVisible(state) {
    this.recordProxy.record.setFieldAsVisible(this.alias, state);
  }

  setEnabled(state) {
    this.recordProxy.record.setFieldAsEnabled(this.alias, state);
  }

  setOptions(newOptions = {}) {
    const oldOptions = this.getOptions();

    if (this.type === 'array_string') {
      if (oldOptions.multi_select !== newOptions.multi_select) {
        newOptions.multi_select = oldOptions.multi_select;
      }
    }

    this.recordProxy.record.changeField({
      ...this.recordProxy.record.getField(this.field.alias),
      options: JSON.stringify({ ...oldOptions, ...newOptions }),
    });
  }

  getOptions() {
    return parseOptions(this.field.options);
  }

  getRefValue(referenceFieldAlias) {
    const { extra_attributes } = this.recordProxy.record.metadata;
    const referenceValues = extra_attributes[this.alias] || {};

    return referenceValues[referenceFieldAlias];
  }

  getComments() {
    return this.recordProxy.record.getComments(this.alias);
  }

  setComments(comments) {
    this.recordProxy.record.setComments(this.alias, comments);
  }

  getFilter() {
    const { filter, depends_on_filter, subtype } = this.getOptions();

    const compiler = (query, params) => compileFilter(query, params);

    const queries = [];
    if (filter)            queries.push(compiler(filter, { preserve_strings: subtype !== 'option', type: this.type }));
    if (depends_on_filter) queries.push(compiler(depends_on_filter, { preserve_strings: false, type: this.type }));

    return queries.map((query) => `(${query})`).join(' AND ');
  }
}
