import Promise from 'bluebird';
import { compact, isObject, map, keyBy, every, filter } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import createStorage from './factory.js';

class Cleaner {
  constructor(storage) {
    this.storage = storage;
  }

  perform({ id, file_name, __cross_record }) {
    if (!__cross_record) return;
    const { target_model, target_record_id } = __cross_record;
    const fileName = `attachments/${target_model}/${target_record_id}/${id}/${file_name}`;
    return this.storage.removeObject(fileName);
  }
}

export default async (attachments) => {
  const storage = await createStorage();
  const cleaner = new Cleaner(storage);

  const crossRecordsIds = compact(map(attachments, 'target_record'));
  if (!crossRecordsIds.length) return;

  if (every(crossRecordsIds, isObject)) {
    return Promise.map(filter(attachments, 'target_record'), (attachment = {}) => {
      return cleaner.perform({ ...attachment, __cross_record: {
        target_model: attachment.target_record.model,
        target_record_id: attachment.target_record.id,
      } });
    });
  }

  const crossRecords = await db.model('global_references_cross').whereIn('id', crossRecordsIds);
  const crossRecordsMap = keyBy(crossRecords, 'id');

  return Promise.map(attachments, (attachment) => {
    const cross_record = crossRecordsMap[attachment.target_record];
    return cleaner.perform({ ...attachment, __cross_record: cross_record });
  });
};
