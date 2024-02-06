import { isNil, isString, isArray, isNaN, isEmpty } from 'lodash/lang';
import { difference } from 'lodash/array';
import { each, filter } from 'lodash/collection';
import { get } from 'lodash/object';

import { parseOptions } from '../../../../helpers';

const isPureNumber = v => !isNaN(Number(v));
const isFloat = n => (parseFloat(n) % 1 !== 0) || (isString(n) && n.includes('.'));

const NUMERICAL_PARSERS = {
  integer: (v) => isPureNumber(v) && !isFloat(v) ? parseInt(v) : NaN,
  float: (v) => isPureNumber(v) ? parseFloat(v) : NaN,
};

export default (record) => {
  if (!record.metadata) return [];
  if (!record.metadata.fields) return [];
  if (!record.metadata.fields.length) return [];

  return record.metadata.fields.reduce((errors, { alias }) => {
    const field = record.getField(alias);
    const validator = new FieldValidator(field, record);

    validator.validate(record.get(alias));
    errors[alias] = validator.results;

    return errors;
  }, {});
};

class FieldValidator {
  constructor(field, record) {
    this.field = field;
    this.sandbox = record.sandbox;
    this.results = [];
    this.options = parseOptions(field.options);
    this.extraFieldsAttributes = filter(record.metadata.extraFieldsAttributes, ({ id }) => field.extra_attributes.includes(id));
    this.extraAttributes = record.extraAttributes;
    this.required = record.isFieldRequired(field.alias);
  }

  validate(value) {
    this._validatePresence(value);

    if (this.field.type === 'string' && value) {
      this._validateLength(value.toString());
      this._validateFormat(value.toString());
      this._validateJSON(value.toString());
    }

    if (this.field.type === 'array_string' && value) {
      this._validateLength(value.toString());
      this._validateInclusion(value.toString());
    }

    if (['integer', 'float'].includes(this.field.type)) {
      this._validateNumericality(value);
      this._validateRanges(value);
    }
  }

  _validatePresence(value) {
    this._validateValuePresence(value);
    this._validateExtraValuesPresence(value);
  }

  _validateValuePresence(value) {
    const state = this.required;
    const script = this.field.required_when_script && this.sandbox.executeScript(this.field.required_when_script, { modelId: this.field.model }, `field/${this.field.id}/required_when_script`);

    const isRequired = (script && (state === false)) ? state : (state || script);
    if (!isRequired) return;
    if (this.options.subtype === 'folder') return;

    if (isNil(value) || (isString(value) && !value.trim()) || (isArray(value) && value.length === 0)) {
      this.results.push({
        type: 'presence',
        message: i18n.t('field_cannot_be_blank', { defaultValue: '{{field}} can\'t be blank', field: this.field.name }),
      });
    }
  }

  _validateExtraValuesPresence() {
    each(this.extraFieldsAttributes, (attribute) => {
      const comments = get(this.extraAttributes, `${this.field.alias}.__${(attribute || {}).type}`) || [];

      if (!attribute.required_when_extra || comments.length) return;
      if (!this.sandbox.executeScript(attribute.required_when_extra, { modelId: this.field.model }, `extra_field_attribute/${attribute.id}/reruired_when_extra`)) return;

      this.results.push({
        type: 'presence',
        message: i18n.t('comments_for_field_cannot_be_empty', { defaultValue: 'Comments field "{{attributeName}}" for field "{{fieldName}}" can not be empty', attributeName: attribute.name, fieldName: this.field.name }),
      });
    });
  }

  _validateLength(value) {
    if (this.options.length === 'unlimited') return;
    const length = this.options.length || 255;
    if (value.length <= length) return;

    this.results.push({
      type: 'length',
      message: i18n.t('field_cannot_be_longer_than_length', { defaultValue: '{{field}} can\'t be longer than {{length}} characters', field: this.field.name, length }),
    });
  }

  _validateFormat(value) {
    if (!this.options.format) return;
    if (new RegExp(this.options.format).test(value)) return;

    this.results.push({
      type: 'format',
      message: i18n.t('field_has_wrong_format', { defaultValue: '{{field}}: Wrong field format', field: this.field.name }),
    });
  }

  _validateJSON(value) {
    if (this.options.syntax_hl !== 'JSON') return;
    if (value.length && !isEmpty(parseOptions(value))) return;

    this.results.push({
      type: 'format',
      message: i18n.t('field_has_invalid_json_value', { defaultValue: '{{field}}: Invalid JSON value', field: this.field.name }),
    });
  }

  _validateInclusion(value) {
    const values = this.options.values || {};

    if (Object.keys(values).includes(value)) return;

    if (this.options.multi_select) {
      if (!difference(this.options.values, value).length) return;
    }

    this.results.push({
      type: 'inclusion',
      message: i18n.t('field_must_have_one_of_the_values', { defaultValue: '{{field}} must be one of: {{values}}', field: this.field.name, values: Object.values(values).join(', ') }),
    });
  }

  _validateNumericality(value) {
    if (value === 'unlimited') return;
    const parsedValue = NUMERICAL_PARSERS[this.field.type](value);
    if (!value || !isNaN(parsedValue)) return;
    const fieldType = this.field.type === 'float' ? 'a float' : 'an integer'

    this.results.push({
      type: 'numericality',
      message: i18n.t(`field_must_be_a${this.field.type === 'float' ? '_float' : 'n_integer'}`, { defaultValue: '{{field}} must be {{type}}', type: this.field.type === 'integer' ? 'an integer' : 'a float', field: this.field.name }),
    });
  }

  _validateRanges(value) {
    if (isNil(value)) return;
    let { min, max, step, use_null } = this.options;

    if (step || use_null) {
      min = min || 0;
      max = max || 100;
    }

    if (!isNil(min) && (value < min)) {
      this.results.push({
        type: 'numericality',
        message: i18n.t('field_is_less_than_min', { defaultValue: '{{field}}: value is less than its "min" option ({{min}})', field: this.field.name, min }),
      });
    }

    if (!isNil(max) && (value > max)) {
      this.results.push({
        type: 'numericality',
        message: i18n.t('field_is_greater_than_max', { defaultValue: '{{field}}: value is greater than its "max" option ({{max}})', field: this.field.name, max }),
      });
    }
  }
}
