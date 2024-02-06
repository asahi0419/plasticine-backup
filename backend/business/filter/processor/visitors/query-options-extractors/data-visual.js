import { map, isNull, isString, isArray } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';

export default async (field, operator, value, context) => {
  const modelTableName = db.model(field.model).tableName;
  const tCrossTableName = db.model('t_cross').tableName;
  const [dvfAlias, dtfAlias, dataModelId, dataFieldAlias] = field.__alias.replace('__dvf__', '').split('/');
  const emptyResult = { where: [db.client.raw(`${modelTableName}.id IS NULL`)] };

  if (isNull(value)) value = null;
  if (isString(value)) value = `'${value}'`;
  if (isArray(value) && (operator !== 'between')) value = `(${map(value, v => `'${v}'`)})`;
  if (operator === 'between') value = map(value, v => `'${v}'`).join(' AND ');

  const dataModel = db.getModel(dataModelId);
  const dataRecords = await db.model(dataModel.alias).whereRaw(`${dataFieldAlias} ${operator} ${value}`);
  if (!dataRecords.length) return emptyResult;

  const dvfField = db.getField({ model: context.model.id, alias: dvfAlias });
  const tCrosses = await db.model('t_cross').where({ data_model_id: dataModel.id, dvf_field_id: dvfField.id }).whereIn('data_record_id', map(dataRecords, 'id'));
  if (!tCrosses.length) return emptyResult;

  return {
    where: [db.client.raw(`${tCrossTableName}.id IN (${map(tCrosses, 'id')})`)],
    joins: [{
      tableName: tCrossTableName,
      onItems: [{ left: `${modelTableName}.id`, right: `${tCrossTableName}.dvf_record_id` }],
    }],
  };
};
