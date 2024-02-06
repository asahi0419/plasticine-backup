import moment from 'moment';
import lodash from 'lodash';

import Messenger from '../../../../../messenger';
import { escapeValue } from '../../../../shared/filter/query-generator/expression-generators/helpers';
import {parseOptions, parseDateFormat, getSetting} from '../../../../../helpers';
import { NUMBER_MAX_LENGTH } from "../../../../../constants";
import * as CONSTANTS from "../../../../../constants";

export const parseDateTime = (value, format) => {
  return moment(value, format).isValid() && moment(value, format);
};

export const errorMessage = (key, defaultValue, field = {}) => {
  Messenger.error({ content: i18n.t(key, { defaultValue, field: field.name }) });
  return;
}

export const filterExpression = (field, value, refFields) => {
  const options = parseOptions(field.options);
  let { type } = field;

  if (type === 'reference') {
    const foreignLabel = extractConcatenatedFields(options.foreign_label);
    const alias = `${field.alias}.${foreignLabel.length > 0 ? foreignLabel[0] : ''}`;
    const index = lodash.findIndex(refFields, { alias })
    const refField = index >= 0 && refFields[index]
    const refFieldType = refField && refFields[index].type
    const commonRefQuery = `__qs__${field.alias} LIKE '%${escapeValue(value)}%'`

    if (refFieldType === 'datetime') {
      const refOptions = parseOptions(refField.options) || {}
      if (refOptions.date_only || refOptions.no_time) return commonRefQuery

      const format = getSetting('format').field_date_notime
      const parsedValue = parseDateTime(value, format).format(format)

      return `__qs__${field.alias} BETWEEN '${parsedValue} 00:00:00' AND '${parsedValue} 23:59:59'`
    }

    return commonRefQuery
  }

  switch (type) {
    case 'boolean':
      value = ['false', 'no', ''].includes(value.toLowerCase().trim()) || value.toLowerCase().trim() === '0' ? 'false' : 'true';
      return `__qs__${field.alias} = ${value}`;

    case 'integer':
    case 'primary_key':
      return (!parseInt(value) && !['0', 0].includes(value))
        ? errorMessage('field_must_be_an_integer', `${field.name} must be an integer`, field)
        : `__qs__${field.alias} = ${value}`;

    case 'float':
      value = parseFloat(value);
      return lodash.isNaN(value)
        ? errorMessage('field_must_be_a_float', `${field.name} must be a float`, field)
        : `__qs__${field.alias} = ${value}`;

    case 'file':
    case 'autonumber':
    case 'condition':
    case 'filter':
    case 'string':
      return `__qs__${field.alias} LIKE '%${escapeValue(value)}%'`;

    case 'array_string':
    case 'reference_to_list':
      const searchKey = lodash.findKey(options.values, (v) => String(v).toLowerCase() === String(value).toLowerCase());
      return searchKey
        ? `__qs__${field.alias} = '${escapeValue(searchKey)}'`
        : `__qs__${field.alias} LIKE '%${escapeValue(value)}%'`;

    case 'datetime':
      const { field_date_notime: format } = getSetting('format');
      const offset = -new Date().getTimezoneOffset();
      const { date_only } = options;

      if (CONSTANTS.DATE_INTERVALS.includes(value)) {
        return `__qs__${field.alias} = '${value}'`;
      } else {
        const parsedValue = parseDateTime(value, format);
        // if (date_only || CONSTANTS.DATE_ONLY_FORMATS.includes(parseDateFormat(options))) {
        if (date_only || CONSTANTS.DATE_ONLY_FORMATS.includes(format)) {
          return parsedValue
            ? `__qs__${field.alias} = '${parsedValue.utcOffset(offset).format(format)}'`
            : errorMessage('field_has_wrong_format', `${field.name}: Wrong field format`, field);
        }

        return parsedValue
          ? `__qs__${field.alias} BETWEEN '${parsedValue.utcOffset(offset).format(format)} 00:00:00' AND '${parsedValue.utc().format(format)} 23:59:59'`
          : errorMessage('field_has_wrong_format', `${field.name}: Wrong field format`, field);
      }

    case 'fa_icon':
    case 'color':
    case 'global_reference':
    default:
      errorMessage('field_type_handler_undefined', `${field.type}: Field type handler is undefined`, field);
  }
};

export const isValidSymbol = (params) => {
  const {field, key, searchText, refFields} = params;
  const { type, options:fieldOptions } = field || {};
  const options = parseOptions(fieldOptions);
  let { type:fieldType } = field;
  const { field_date_notime:dateFormat } = getSetting('format');

  if(fieldType === 'reference'){
    const foreignLabel = extractConcatenatedFields(options.foreign_label);
    const alias = `${field.alias}.${foreignLabel.length > 0 ? foreignLabel[0] : ''}`;
    const index = lodash.findIndex(refFields, {alias:alias})
    const foreignType = index >= 0 ? refFields[index].type : 'string';
    return validSymbolByFieldType({
      type : foreignType, field, key, searchText, dateFormat
    });
  }
  return validSymbolByFieldType({type, field, key, searchText, dateFormat});
};

export const validSymbolByFieldType  = (params) => {
  const {type, field, key, searchText, dateFormat} = params;
  switch (type) {
    case 'boolean':
      return !(!'truefalse01'.includes(key.toLowerCase()) || searchText.length >= 5);

    case 'integer':
      if(searchText.includes('-') && '-'.includes(key))
        return false;
      return  !(!'-0123456789'.includes(key) || searchText.length >= NUMBER_MAX_LENGTH);

    case 'primary_key':
    {
      const isNumber = /^[0-9]$/i.test(key);
      return !(!isNumber || searchText.length >= NUMBER_MAX_LENGTH);
    }

    case 'float':
      if(searchText.includes('.') && '.'.includes(key))
        return false;
      if((searchText.includes('+') || searchText.includes('-')) && '+-'.includes(key))
        return false;
      return  !(!'-+0123456789.'.includes(key) || searchText.length >= NUMBER_MAX_LENGTH);

    case 'condition':
    case 'file':
    case 'filter':
    case 'string':
    case 'color':
    case 'array_string':
    case 'reference_to_list':
    case 'autonumber':
      return !(searchText.length >= 255);

    case 'datetime':
      return  !(!' :-+0123456789.,\/'.includes(key) || searchText.length >= dateFormat.length);

    case 'reference':
      return 'reference';

    case 'fa_icon':
    case 'journal':
    case 'data_template':
    case 'data_visual':
    case 'global_reference':
    default: {
      errorMessage('field_type_handler_undefined', `${type}: Field type handler is undefined`, field);
      return false;
    }
      return true;
  }
}

export const getPlaceholderContent  = (field, refFields) => {
  const { type, options: fieldOptions } = field || {};
  const options = parseOptions(fieldOptions);
  const { field_date_notime: dateFormat } = getSetting('format');

  if (type === 'reference') {
    const foreignLabel = extractConcatenatedFields(options.foreign_label);
    const alias = `${field.alias}.${foreignLabel.length > 0 && foreignLabel.length < 2 ? foreignLabel[0] : ''}`;
    const index = lodash.findIndex(refFields, {alias:alias})
    const foreignType = index >= 0 ? refFields[index].type : 'string';

    return getPlaceholderContentByFieldType(foreignType, dateFormat);
  }

  return getPlaceholderContentByFieldType(type, dateFormat);
};

export const getPlaceholderContentByFieldType = (type, format) => {
  switch (type) {
    case 'boolean':
      return i18n.t('qs_boolean_placeholder', { defaultValue: 'Type in: true, false, 1, 0'});

    case 'integer':
    case 'primary_key':
      return i18n.t('qs_numeric_placeholder', { defaultValue: 'Type in a numeric value' });

    case 'float':
      return i18n.t('qs_float_placeholder', { defaultValue: 'Type in a float value' });

    case 'datetime':
      return i18n.t('qs_date_placeholder', { defaultValue: '{{format}}', format });

    case 'condition':
    case 'filter':
    case 'string':
    case 'color':
    case 'array_string':
    case 'reference':
    case 'autonumber':
      return i18n.t('qs_value_placeholder', { defaultValue: 'Type in a value' });

    default: {
      return i18n.t('qs_value_placeholder', { defaultValue: 'Type in a value' });
    }
  }
}

export const getPopupContent  = (field, refFields) => {
  const { type, options:fieldOptions } = field || {};
  const options = parseOptions(fieldOptions);

  const { field_date_notime:dateFormat } = getSetting('format');

  if(type === 'reference'){
    const foreignLabel = extractConcatenatedFields(options.foreign_label);
    const alias = `${field.alias}.${foreignLabel.length > 0 ? foreignLabel[0] : ''}`;
    const index = lodash.findIndex(refFields, {alias:alias})
    const foreignType = index >= 0 ? refFields[index].type : 'string';
    return getPopupContentByFieldType(foreignType, dateFormat);
  }
  return getPopupContentByFieldType(type, dateFormat);
};

export const getPopupContentByFieldType = (type, format) => {
  switch (type) {
    case 'boolean':
      return i18n.t('qs_boolean_hint', { defaultValue: 'Type in a boolean value: "true", "false", "1", "0" and press Enter to initiate search.' });

    case 'integer':
    case 'primary_key':
      return i18n.t('qs_numeric_hint', { defaultValue: 'Type in a numeric value and press Enter to initiate search.' });

    case 'float':
      return i18n.t('qs_float_hint', { defaultValue: 'Type in a numeric / float value and press Enter to initiate search.' });

    case 'datetime':
      return i18n.t('qs_date_hint', { defaultValue:  'Type in a date in format {{format}} and press Enter to initiate search.', format });

    case 'reference':
    case 'condition':
    case 'filter':
    case 'string':
    case 'color':
    case 'array_string':
    case 'autonumber':
      return i18n.t('qs_value_hint', { defaultValue: 'Type in a value or a part of it and press Enter to initiate search.' });

    default: {
      return i18n.t('qs_value_hint', { defaultValue: 'Type in a value or a part of it and press Enter to initiate search.' });
    }
  }
}

export const isPatternMode = (value) => /\{\w+\}/.test(value);

export const isFloat = (value) => {
  if (lodash.isNaN(parseFloat(value))) return false;
  return parseFloat(value) % 1 !== 0;
}

export const extractConcatenatedFields = (value) => {
  if (!value) return [];
  return isPatternMode(value)
      ? (value.match(/\{\w+\}/g) || []).map(part => part.slice(1, -1))
      : [value]
};
