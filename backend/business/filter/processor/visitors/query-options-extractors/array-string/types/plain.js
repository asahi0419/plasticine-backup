import { each, isArray, isNull } from 'lodash-es';

import db from '../../../../../../../data-layer/orm/index.js';
import { parseOptions, makeUniqueID } from '../../../../../../helpers/index.js';
import { getClause, getClearingClause, getLikeRegExp, getLikeValue, getFrom } from '../helpers.js';

export default async (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;

  const clause = getClause(field, modelTableName);
  const clearingClause = getClearingClause(modelTableName);

  const result = { froms: [], where: [] };
  const from = getFrom(field, modelTableName);
  const alias = `${field.alias}_${makeUniqueID()}`

  const { values = {} } = parseOptions(field.options);

  if ((operator === 'not in') && value) {
    each((isArray(value) ? value : [value]), (v) => result.where.push(db.client.notLikeCondition(`"${modelTableName}"."${field.alias}"`, v)));
    result.whereOperator = 'and';
  } else if ((operator === 'in') && value) {
    each(isArray(value) ? value : [value], (v) => result.where.push(clause(operator, value)));
    result.whereOperator = 'or';
  } else if (['like', 'not like'].includes(operator)) {
    if (!isNull(value)) {
      if (['like'].includes(operator)) {
        if ((value === '%%') || (value === '%')) {
          result.where.push(db.client.raw(`${modelTableName}.${field.alias} IS NULL`));
        }

        each(values, (v, key) => {
          if (getLikeRegExp(value).test(v)) result.where.push(clause(operator, getLikeValue(value, key)));
        });
      }

      if (['not like'].includes(operator)) {
        if ((value !== '%%') && (value !== '%')) {
          result.where.push(db.client.raw(`${modelTableName}.${field.alias} IS NULL`));

          const collected = [];
          each(values, (v, key) => {
            if (getLikeRegExp(value).test(v)) collected.push(key);
          });
          result.where.push(clause('not in', collected));
        }
      }
    } else {
      result.where.push((operator === 'not like'));
    }

    if (result.where.length) {
      result.whereOperator = 'or';
    } else {
      result.where.push(db.client.raw(`${modelTableName}.id = -1`));
    }
  } else {
    if (isNull(value)) {
      if (operator === '=') operator = 'IS';
      if (operator === '!=') operator = 'IS NOT';
    } else {
      if (operator === '!=') {
        result.where.push(db.client.raw(`${modelTableName}.${field.alias} IS NULL`));
        result.whereOperator = 'or';
      }
    }

    result.where.push(clause(operator, value));

    if (field.__parentField) {
      const parentModel = db.model(field.__parentField.model);

      if (parentModel.tableName !== modelTableName) {
        result.froms.push(db.client.arrayStringToArrayFromClause(from, field, alias));
      }
    }
  }

  return result;
};
