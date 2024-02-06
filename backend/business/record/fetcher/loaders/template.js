import Promise from 'bluebird';
import { filter, map, find, isArray } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Fetcher from '../index.js';

export default async (records, model, sandbox, options = {}) => {
  const fieldsScope = db.model('field').where({ model: model.id, type: 'data_visual', __inserted: true });
  if (isArray(options.fieldset) && options.fieldset.length) fieldsScope.whereIn('alias', options.fieldset);

  const fields = await fieldsScope;
  if (!fields.length) return { records };

  const modelTableName = db.model(model.alias).tableName;

  const tCrossRows = await db.model('t_cross').whereRaw(`dvf_record_id IN (SELECT DISTINCT ${modelTableName}.id FROM ${modelTableName} WHERE ${modelTableName}.id IN (${map(records, 'id')})) AND dvf_field_id IN (${map(fields, 'id')})`);
  if (!tCrossRows.length) return { records };

  const dataFieldRows = await db.model('field').whereIn('model', map(tCrossRows, 'data_model_id')).select(['alias', 'model', 'created_at', 'marked_as_deleted']);

  const tCrossMap = map(tCrossRows, (tCrossRow) => {
    const record = find(records, { id: tCrossRow.dvf_record_id });
    const fields = filter(dataFieldRows, (field) => (field.model === tCrossRow.data_model_id) && (field.created_at < record.created_at) && (!field.marked_as_deleted || (field.marked_as_deleted > record.created_at)));
    return { ...tCrossRow, fields: { [`_${db.getModel(tCrossRow.data_model_id).alias}`]: map(fields, 'alias').join(',') } };
  });

  const templateRows = await Promise.reduce(tCrossMap, async (result, { id, data_model_id, data_record_id, fields }) => {
    const model = db.getModel(data_model_id);
    const params = { humanize: true, filter: `id = ${data_record_id}`, fields };
    const [template] = (await new Fetcher(model, sandbox, params).fetch()).records;

    result.push(template);
    return result;
  }, []);

  return { records, templateFields: fields, preloadedTCrossRecords: tCrossRows, preloadedTemplateRecords: templateRows };
}
