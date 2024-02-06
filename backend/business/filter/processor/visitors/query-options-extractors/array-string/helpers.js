import db from '../../../../../../data-layer/orm/index.js';

export const getClause = (field, modelTableName) => (operator, value) => {
  return [`${modelTableName}.${field.alias}`, operator, value];
};

export const getClearingClause = (modelTableName) => (operator) => {
  const exception = operator.includes('not') ? '!=' : '=';
  return db.client.raw(`${modelTableName}.id ${exception} -1`);
};

export const getLikeRegExp = (value) => {
  if (value.startsWith('%') && value.endsWith('%')) return new RegExp(`${value.slice(1, -1)}`, 'i');
  if (value.startsWith('%')                       ) return new RegExp(`${value.slice(1)}$`, 'i');
  if (                         value.endsWith('%')) return new RegExp(`^${value.slice(0, -1)}`, 'i');
};

export const getLikeValue = (value, key) => {
  if (value.startsWith('%') && value.endsWith('%')) return `%${key}%`;
  if (value.startsWith('%')                       ) return `%${key}`;
  if (                         value.endsWith('%')) return  `${key}%`;
};

export const getFrom = (field, modelTableName) => {
  const from = { tableName: modelTableName };

  if (field.__parentField) {
    from.tableName = db.model(field.__parentField.model).tableName;
    from.joins = [{
      type: 'right',
      tableName: modelTableName,
      onItems: [
        {
          left: `${modelTableName}.id`,
          right: `${from.tableName}.${field.__parentField.alias}`,
        },
      ],
    }];
  }

  return from;
}
