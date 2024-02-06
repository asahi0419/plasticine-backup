import { isInteger, map, difference } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';

export const getSyncedData = async (field, record) => {
  const { foreign_model, sync_to } = parseOptions(field.options);
  if (!sync_to || !isInteger(sync_to)) return;

  const foreignModel = db.getModel(foreign_model);
  const syncToField = db.getField({ id: sync_to });
  if (!syncToField) return;

  const targetIds = record[field.alias] || [];
  const rows = await db.model('rtl').where({ source_field: syncToField.id, target_record_id: record.id });
  const existedIds = map(rows, 'source_record_id');
  const addedIds = difference(targetIds, existedIds);
  const deletedIds = difference(existedIds, targetIds);

  if (addedIds.length || deletedIds.length) return { addedIds, deletedIds, foreignModel, syncToField };
};
