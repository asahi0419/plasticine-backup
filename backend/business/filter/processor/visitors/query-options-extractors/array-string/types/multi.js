import { each, map, isArray, isNull } from 'lodash-es';

import db from '../../../../../../../data-layer/orm/index.js';
import { makeUniqueID } from '../../../../../../helpers/index.js';
import { getClause, getClearingClause, getFrom } from '../helpers.js';

export default async (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;

  const clause = getClause(field, modelTableName);
  const clearingClause = getClearingClause(modelTableName);

  const result = { froms: [], where: [] };
  const from = getFrom(field, modelTableName);
  const alias = `${field.alias}_${makeUniqueID()}`

  if (isArray(value)) {
    value = map(value, (v) => `'${v.trim().replace(/\'(.*)\'/,'$1')}'`);
  }

  if (field.__mode) {
    if (isArray(value)) {
      const exception = operator.includes('not') ? 'not' : '';

      value = `array[${value.map((v) => `'''${v.replace(/\'(.*)\'/,'$1')}'''`).join(',')}]`;
      operator = (field.__mode === 'strict') ? '<@' : '@>';

      if (exception) {
        result.whereOperator = 'or';
        result.where.push(db.client.raw(`${alias} IS NULL`));
      }

      result.where.push(db.client.raw(`${exception} ${alias} ${operator} ${value}`));
    }

    if (isNull(value)) {
      result.where.push(clearingClause(operator));
    }

    result.froms.push(db.client.arrayStringToArrayFromClause(from, field, alias));
  } else {
    if (operator === 'in') {
      if (isArray(value)) {
        each(value, (v) => result.where.push(clause('like', `%${v}%`)));
        result.whereOperator = 'or';
      }

      if (isNull(value)) {
        result.where.push(clearingClause(operator));
      }
    } else {
      if (isArray(value)) {
        result.where.push(clause(operator, value.sort().join(',')));
        if (operator === '!=') {
          result.where.push(db.client.raw(`${alias} IS NULL`));
          result.whereOperator = 'or';
        }
      }

      if (isNull(value)) {
        if (operator === '=') operator = 'is';
        if (operator === '!=') operator = 'is not';
        result.where.push(clause(operator, value));
      }

      result.froms.push(db.client.arrayStringToArrayFromClause(from, field, alias));
    }
  }

  return result;
};
