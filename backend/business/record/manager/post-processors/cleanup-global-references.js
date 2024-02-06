import Promise from 'bluebird';
import { map } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';

export default async (model, recordIds, sandbox) => {
  const fields = db.getFields({ model: model.id, type: 'global_reference' });
  await db.model('global_references_cross').whereIn('source_field', map(fields, 'id'))
                                           .whereIn('source_record_id', recordIds).delete();

  const crossRecords = await db.model('global_references_cross').where({ target_model: model.id })
                                                                .whereIn('target_record_id', recordIds);
  if (!crossRecords.length) return;

  await Promise.map(crossRecords, (record) => cleanupSourceRecord(record, sandbox))
  await db.model('global_references_cross').whereIn('id', map(crossRecords, 'id')).delete();
};

async function cleanupSourceRecord({ id, source_field, source_record_id }, sandbox) {
  const field = db.getField({ id: source_field });
  const model = db.getModel(field.model);

  const record = await db.model(model.alias).where({ id: source_record_id }).getOne();
  if (!record) return;

  if (['email', 'attachment'].includes(model.alias)) {
    return db.model(model.alias, sandbox).destroyRecord(record, false);
  }

  // temporary disabled. https://redmine.nasctech.com/issues/63921
  // const attributesToUpdate = {};
  // if (record[field.alias] === id) {
  //   attributesToUpdate[field.alias] = null;
  // }
  // return db.model(model.alias).where({ id: source_record_id }).update(attributesToUpdate);
}
