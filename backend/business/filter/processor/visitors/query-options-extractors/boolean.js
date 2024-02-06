import { isNull, isUndefined } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';

export default async (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;
  const result = { where: [], froms: [] };

  if (field.__parentField) {
    const tableName = db.model(field.__parentField.model).tableName;
    result.froms.push({ tableName, joins: [{
      type: 'right',
      tableName: modelTableName,
      onItems: [{
        left: `${modelTableName}.id`,
        right: `${tableName}.${field.__parentField.alias}`,
      }],
    }] });
  }

  if (isUndefined(value)) {
    result.where.push(db.client.raw(`${modelTableName}.id ${operator} -1`));
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
    result.where.push(db.client.raw(`${modelTableName}.${field.alias} ${operator} ${value}`));
  }

  return result;
};
