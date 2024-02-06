import { isString, isNull, isNumber, isArray } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../../helpers/index.js';

const NOT_LIKE_FIELD_TYPES = ['primary_key', 'integer', 'float'];

export default async (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;
  const column = `${modelTableName}.${field.alias}`;

  const result = { where: [] };

  if (isNull(value)) {
    operator = operator.includes('is') ? operator : ((operator === '=')  ? 'IS' : 'IS NOT');
    result.where.push(db.client.raw(`${column} ${operator} NULL`));
    return result
  } else {
    if (operator === '!=') {
      result.where.push(db.client.raw(`${column} IS NULL`));
      result.whereOperator = 'or';
    }
  }

  if (['like'].includes(operator)) {
    if (isSignature(field)) {
      return processSignature(column, operator, value, result);
    }
  }

  if (['like', 'not like'].includes(operator)) {
    if (isString(value)) value = value.replace(/\\/g, '\\\\');
    if (NOT_LIKE_FIELD_TYPES.includes(field.type) && isNaN(value)) {
      result.where.push(db.client.raw(`${column} IS NULL`));
      return result;
    }
  }

  operator = (NOT_LIKE_FIELD_TYPES.includes(field.type) && operator === 'like') ? '=': operator;

  if (['not in'].includes(operator)) {
    if (value) {
      result.where.push(db.client.raw(`${column} IS NULL`));
      result.whereOperator = 'or';
    }
  }

  if (['like'].includes(operator)) {
    operator = db.client.caseInsensitiveLikeClause();

    if (value === '%%') {
      result.where.push(db.client.raw(`${column} IS NULL`));
      result.whereOperator = 'or';
    }
  }

  if (['not like'].includes(operator)) {
    operator = 'not ' + db.client.caseInsensitiveLikeClause();

    if (value !== '%%') {
      result.where.push(db.client.raw(`${column} IS NULL`));
      result.whereOperator = 'or';
    }
  }

  if (operator === 'between') {
    if (isNumber(value[0]) && isNumber(value[1])) {
      result.where.push(db.client.raw(`${column} is not null`));
      result.where.push(db.client.raw(`${column} >= '${value[0]}'`));
      result.where.push(db.client.raw(`${column} <= '${value[1]}'`));
    } else {
      result.where.push(false);
    }
  } else {
    if (field.type === 'string') {
      const esc = (v) => v.replace(/'/g, "''");

      if (isArray(value)) {
        if (value.length) {
          value = `(${value.map((v) => `'${esc(v)}'`)})`;
        } else {
          value =  `('')`;
        }
      } else {
        value = `'${esc(value)}'`;
      }

      result.where.push(db.client.raw(`${column} ${operator} ${value}`));
      return result;
    }

    result.where.push([`${column}`, operator, value]);
  }

  return result;
};

const isSignature = (field) => {
  if (field.type !== 'string') return false;
  const options = parseOptions(field.options);
  return options.syntax_hl === 'signature';
}

const processSignature = (column, operator, value, result) => {
  let val = value;
  if (/^%/.test(val)) val = val.replace(/^%/, '');
  if (/%$/.test(val)) val = val.replace(/%$/, '*');
  const regex = new RegExp(val, 'i');
  const dataChecker = `'data:%;base64,%'`;

  if (['like'].includes(operator)) {
    operator = db.client.caseInsensitiveLikeClause();
    if (regex.test('unsigned')) {
      result.where.push(db.client.raw(`${column} IS NULL`));
    } else if (regex.test('signed')) {
      result.where.push(db.client.raw(`${column} ${operator} ${dataChecker}`));
    } else if (regex.test('error')) {
      result.where.push(db.client.raw(`${column} not ${operator} ${dataChecker}`));
    }
    return result;
  }
}
