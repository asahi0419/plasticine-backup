import { pick } from 'lodash-es';

import cache from '../../../presentation/shared/cache/index.js';

export const reloadCache = (action) => (record, sandbox) => {
  const payload = pick(record, ['id', 'model', 'record_id', 'update', 'delete', 'field_update']);

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'core_locks',
    params: { action, payload },
  });
}

export default {
  after_insert: [reloadCache('insert')],
  after_update: [reloadCache('update')],
  after_delete: [reloadCache('delete')],
};
