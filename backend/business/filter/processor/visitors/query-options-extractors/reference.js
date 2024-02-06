import lodash from 'lodash';
import moment from 'moment';

import db from '../../../../../data-layer/orm/index.js';
import defaultExtractor from './default.js';
import { parseOptions, columnNameFromConcatenatedFields } from '../../../../helpers/index.js';
import { getSetting } from '../../../../setting/index.js';

export default (field, operator, value, context) => {
  if (operator === 'like') {
    return byForeignLabelExtractor(field, operator, value, context);
  } else if (operator === 'between' && lodash.isArray(value)) {
    return datetimeExtractor(field, operator, value, context)
  } else {
    return defaultExtractor(field, operator, value)
  }
};

function datetimeExtractor(field, operator, value, context) {
  const modelTableName = db.model(field.model).tableName;
  const { foreign_model, foreign_label } = parseOptions(field.options);
  const refTableName = db.model(foreign_model).tableName;
  const asRefTableName = refTableName + '_' + Math.random().toString().slice(2,8);
  const columnName = columnNameFromConcatenatedFields(foreign_label, asRefTableName, 'datetime', 'second');
  const format = getSetting('format').field_date_time
  const formatter = (v) => v ? moment(v, format).format(format) : v;

  value = lodash.map(value, formatter)
  let where = []

  if (operator === 'between') {
    if (!value[0] || !value[1]) {
      where.push(false);
    } else {
      where.push(db.client.raw(`${columnName} is not null`));
      where.push(db.client.raw(`${columnName} >= '${value[0]}'`));
      where.push(db.client.raw(`${columnName} <= '${value[1]}'`));
    }
  }
  
  return {
    where,
    whereOperator: where.length > 1 ? 'and' : 'or',
    joins: [{
      tableName: refTableName + ' AS ' + asRefTableName,
      onItems: [{ left: `${asRefTableName}.id`, right: `${modelTableName}.${field.alias}` }],
    }]
  };
}

function byForeignLabelExtractor(field, operator, value, context) {
  const modelTableName = db.model(field.model).tableName;
  const { foreign_model, foreign_label } = parseOptions(field.options);
  const refTableName = db.model(foreign_model).tableName;
  const asRefTableName = refTableName + '_' + Math.random().toString().slice(2,8);

  const columnName = columnNameFromConcatenatedFields(foreign_label, asRefTableName);
  const where = [db.client.raw(`${columnName}::text ${db.client.caseInsensitiveLikeClause()} ?`, value)];

  return {
    where,
    whereOperator: where.length > 1 ? 'or' : 'and',
    joins: [{
      tableName: refTableName + ' AS ' + asRefTableName,
      onItems: [{ left: `${asRefTableName}.id`, right: `${modelTableName}.${field.alias}` }],
    }],
  };
}
