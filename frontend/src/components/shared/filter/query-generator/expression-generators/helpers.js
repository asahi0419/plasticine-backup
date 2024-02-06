import { map, filter } from 'lodash/collection';
import { isArray, isNil, isDate, isObject, isString, isNaN } from 'lodash/lang';

import typecast from '../../../../../field/value/typecast';
import * as CONSTANTS from './constants';
import { isJSValue } from '../../../../../helpers';

const addColumnPrefix = (alias = '', operator = '') => {
  if (operator.includes('strict')) return `__strict__${alias}`;
  if (operator.includes('having')) return `__having__${alias}`;
  return alias;
};

export const prepareField = (field = {}, operator, humanize) => {
  const [ pa, ca ] = (field.alias || '').split('.');
  const alias = ca ? `${pa}.${addColumnPrefix(ca, operator)}` : addColumnPrefix(pa, operator);
  return humanize ? (field.name || '') : `\`${alias.replace(/\./g, '`.`')}\``;
};

export const prepareOperator = (operator, humanize) => {
  return humanize
    ? CONSTANTS.HUMAN_OPERATORS[operator]
    : CONSTANTS.QUERY_OPERATORS[operator];
};

export const prepareValue = (field, operator, value, humanize) => {
  const prepare = (v) => isJSValue(v) ? `${v.replace(/'/g, '"')}` : typecast(field, v);

  if (['in', 'not_in'].includes(operator)) {
    if (['primary_key', 'integer', 'float', 'reference'].includes(field.type)) {
      if (isJSValue(value)) return prepare(value);
      if (isString(value)) return map(filter(value.split(','), (v) => v && !isNaN(Number(v))), (v) => +v);
      if (isArray(value)) return value;
    }
  }

  if (['between'].includes(operator)) {
    return map(value, (v) => {
      if (isJSValue(v)) return `'${prepare(v)}'`;
      return prepare(v);
    });
  }

  if (humanize) {
    if (isJSValue(value)) return value;
    if (isDate(value)) return value;
    if (isArray(value)) {
      if (CONSTANTS.STRIGIFY_ARRAY_OPERATORS.includes(operator)) return JSON.stringify(value);
      if (CONSTANTS.JOIN_ARRAY_OPERATORS.includes(operator)) return value.join(',');
      return value;
    }
    return typecast(field, value);
  }

  return prepare(value);
};

export const escapeValue = (value = '') => {
  return `${value}`.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
};

export const escapeHumanValue = (value = '') => {
  return (`${value}`.startsWith("'") && `${value}`.endsWith("'")) ? `"${value}"` : `'${value}'`;
};
