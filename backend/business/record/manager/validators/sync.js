import Promise from 'bluebird';
import { isNumber, without } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';
import { getSyncedData } from '../helpers/rtl-sync.js';
import { createManager } from '../factory.js';

export const validateRTLSyncTo = async (record, field, sandbox, flags, withException) => {
  const syncedData = await getSyncedData(field, record);
  if (!syncedData) return;

  const { foreignModel, syncToField, addedIds, deletedIds } = syncedData;
  const syncedRecords = await db.model(foreignModel.alias).whereIn('id', addedIds.concat(deletedIds));
  const recordManager = await createManager(foreignModel, sandbox);

  try {
    await Promise.each(syncedRecords, async (syncedRecord) => {
      const currentValue = await db.model('rtl').where({ source_field: syncToField.id, source_record_id: syncedRecord.id }).pluck('target_record_id');
      const newValue = addedIds.includes(syncedRecord.id) ? currentValue.concat(record.id) : without(currentValue, record.id);
      const attributes = { ...syncedRecord, [syncToField.alias]: newValue };
      await recordManager.validate(attributes, true, { ...flags, skipRtlSyncToValidation: true });
    });
  } catch(err) {
    if (!withException) return false;
    return sandbox.translate('static.rtl_field_related_cannot_apply', { alias: syncToField.alias, error: err.description });
  }
};

export const validateRTLSyncToConfig = async (record, sandbox) => {
  const { foreign_model, sync_to } = parseOptions(record.options);

  if (!sync_to) return;

  const model = db.getModel(record.model);
  const foreignModel = db.getModel(foreign_model);
  const whereOptions = { model: foreignModel.id, type: 'reference_to_list' };
  isNumber(sync_to) ? whereOptions.id = sync_to : whereOptions.alias = sync_to;
  const syncToField = db.getField(whereOptions);

  if (syncToField && parseOptions(syncToField.options).foreign_model === model.alias) return;
  return sandbox.translate('static.to_sync_referenced_model_should_have_rtl_field');
};
