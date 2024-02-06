import db from '../../../../../data-layer/orm/index.js';

export default (field, operator, value) => {
  const modelTableName = db.model(field.model).tableName;
  const grcTableName = db.model('global_references_cross').tableName;
  const columnName = `concat(${grcTableName}.target_model, '/', ${grcTableName}.target_record_id)`;
  const result = { where: [], joins: [] };

  if (value) {
    if (operator === '!=') {
      result.where.push(db.client.raw(`${columnName} IS NULL`));
    }

    if (['=', '!='].includes(operator)) {
      result.where.push(db.client.raw(`${columnName} ${operator} ?`, [value]));
    }

    result.joins.push({
      tableName: grcTableName,
      onItems: [{ left: `${grcTableName}.id`, right: `${modelTableName}.${field.alias}` }],
    })
  } else {
    operator = (operator === '=') ? 'IS' : 'IS NOT';
    result.where.push(db.client.raw(`${modelTableName}.${field.alias} ${operator} NULL`));
  }

  result.whereOperator = result.where.length > 1 ? 'or' : 'and';

  return result;
};
