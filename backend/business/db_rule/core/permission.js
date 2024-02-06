import { pick } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js';

export const reloadCache = (action) => (record) => {
  const payload = pick(record, ['id', 'type', 'action', 'script', 'model', 'field']);

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'permissions',
    params: { action, payload },
  });
}

const createCoreDeleteLock = async (record, sandbox, mode) => {
  const model = db.getModel('permission').id;

  const existedLock = await db.model('core_lock').where({
    model,
    update: false,
    delete: true,
    record_id: record.id
  }).getOne();

  if (existedLock) return;

  await db.model('core_lock', sandbox).createRecord({
    model,
    update: false,
    delete: true,
    record_id: record.id,
    created_by: sandbox.user.id,
    created_at: new Date(),
  }, false);
};

export default {
  after_insert: [reloadCache('insert'), createCoreDeleteLock],
  after_update: [reloadCache('update')],
  after_delete: [reloadCache('delete')],
};
