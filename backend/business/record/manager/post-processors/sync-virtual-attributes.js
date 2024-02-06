import Promise from 'bluebird';
import { map, find, difference, union, without, isArray } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions, isPlainObject } from '../../../helpers/index.js'; // own implementation!
import { RecordNotValidError } from '../../../error/index.js';
import { getSyncedData } from '../helpers/rtl-sync.js';
import { worklogDBModel } from '../../../worklog/model.js';

const processors = {
  global_reference: globalReferenceProcessor,
  reference_to_list: referenceToListProcessor,
  journal: journalProcessor,
};

export default async (service) => {
  let promise = Promise.resolve();
  const originalRecord = service.sandbox.record.previousAttributes || {};
  const record = service.sandbox.record.attributes;
  const virtualFieldTypes = union(db.schema.VIRTUAL_FIELDS, db.schema.CROSS_FIELDS);

  service.modelFields.filter(f => !f.virtual && virtualFieldTypes.includes(f.type)).forEach((field) => {
    promise = promise
      .then(() => processors[field.type](field, originalRecord, record, service))
      .then((result) => service.sandbox.record.assignAttributes({ [field.alias]: result }));
  });

  await promise;
};

async function getExistedCrossRecord(field, record, value) {
  if (isPlainObject(value)) {
    return db.model('global_references_cross').where({ source_record_id: record.id, source_field: field.id, target_model: db.getModel(value.__type || value.model).id, target_record_id: value.id }).getOne();
  } else if (value) {
    return db.model('global_references_cross').where({ id: value }).getOne();
  }
}

async function globalReferenceProcessor(field, originalRecord, record, service) {
  const oldValue = originalRecord[field.alias];
  const newValue = record[field.alias];

  const existedCrossRecord = await getExistedCrossRecord(field, record, oldValue) ||
                             await getExistedCrossRecord(field, record, newValue);

  // if newValue is null -> remove existed cross ref
  if (existedCrossRecord && !newValue) {
    await db.model(service.model).where({ id: record.id }).update({ [field.alias]: null });
    await db.model('global_references_cross', service.sandbox).destroyRecord(existedCrossRecord, false);
  }

  // ignore bellow processing if newValue is null
  if (!newValue) return null;

  // preserve previous built crosses
  if (existedCrossRecord && existedCrossRecord.id === parseInt(newValue, 10)) {
    return db.model('global_references_cross').where({ id: newValue }).update({ __inserted: true });
  }

  if (isPlainObject(newValue) && newValue.id && (newValue.__type || newValue.model)) {
    const targetModel = db.getModel(newValue.__type || newValue.model);
    // do nothing if existed cross ref the same as newValue (in this case is object)
    if (existedCrossRecord &&
        existedCrossRecord.target_model === targetModel.id &&
        existedCrossRecord.target_record_id === newValue.id) {

      if (!existedCrossRecord.__inserted) {
        await db.model('global_references_cross').where({ id: existedCrossRecord.id }).update({ __inserted: true });
      }

      return {
        model: targetModel.id,
        id: newValue.id,
      };
    }

    // main logic - remove existed cross ref and create new one
    existedCrossRecord &&
      await db.model('global_references_cross', service.sandbox).destroyRecord(existedCrossRecord, false);

    const crossRecord = await db.model('global_references_cross', service.sandbox).createRecord({
      target_model: targetModel.id,
      target_record_id: newValue.id,
      source_field: field.id,
      source_record_id: record.id,
    }, false);

    await db.model(service.model).where({ id: record.id }).update({ [field.alias]: crossRecord.id });

    return {
      model: targetModel.id,
      id: newValue.id,
    };
  }
}

async function referenceToListProcessor(field, _, record, service) {
  const targetIds = record[field.alias] || [];
  if (!isArray(targetIds)) return;

  const rows = await db.model('rtl').where({ source_field: field.id, source_record_id: record.id });
  const existedIds = map(rows, 'target_record_id');

  let promise = Promise.resolve();

  existedIds.forEach((targetId) => {
    const row = find(rows, { target_record_id: targetId, __inserted: false });
    if (row && row.id) promise = promise.then(() => db.model('rtl').where({ id: row.id }).update({ __inserted: true }));
  });

  difference(targetIds, existedIds).forEach((targetId) => {
    if (targetId) {
      promise = promise
        .then(() => db.model('rtl', service.sandbox).createRecord({
          source_field: field.id,
          source_record_id: record.id,
          target_record_id: targetId,
        }, false));
    }
  });

  difference(existedIds, targetIds).forEach((targetId) => {
    promise = promise.then(() =>
      db.model('rtl', service.sandbox).destroyRecord(find(rows, { target_record_id: targetId }))
    );
  });

  await promise;
  await rtlSyncToProcessor(field, record, service.sandbox);

  return targetIds;
}

async function rtlSyncToProcessor(field, record, sandbox) {
  const syncedData = await getSyncedData(field, record);
  if (!syncedData) return;
  const { foreignModel, syncToField, addedIds, deletedIds } = syncedData;

  const syncedRecords = await db.model(foreignModel.alias).whereIn('id', addedIds.concat(deletedIds));

  try {
    await Promise.each(syncedRecords, async (syncedRecord) => {
      const currentValue = await db.model('rtl').where({ source_field: syncToField.id, source_record_id: syncedRecord.id }).pluck('target_record_id');
      const newValue = addedIds.includes(syncedRecord.id) ? currentValue.concat(record.id) : without(currentValue, record.id);

      return db.model(foreignModel.alias, sandbox).updateRecord(syncedRecord, { [syncToField.alias]: newValue });
    });
  } catch(err) {
    throw new RecordNotValidError(sandbox.translate('static.rtl_field_related_cannot_apply', { alias: syncToField.alias, error: err.description }));
  }
}

function journalProcessor(field, _, record, service) {
  const itemAttributes = {
    related_field: field.id,
    related_record: record.id,
  };

  const items = record[field.alias] || [];
  if (!items.length) return;

  const promises = items.map(item => item.data
    ? worklogDBModel(field.model, service.sandbox).createRecord({ ...itemAttributes, ...item }, false)
    : Promise.resolve());

  return Promise.all(promises);
}
