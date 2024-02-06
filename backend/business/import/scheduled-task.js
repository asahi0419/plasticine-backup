import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const scheduledTask = await db.model('scheduled_task').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const scheduledTaskMap = keyBy(scheduledTask, 'name');

  return Promise.map(records, async (record) => {
    if (!scheduledTaskMap[record.name]) {
      return db.model('scheduled_task', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
