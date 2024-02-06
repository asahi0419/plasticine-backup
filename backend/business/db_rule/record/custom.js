import cache from '../../../presentation/shared/cache/index.js';

export const reloadCache = (action) => (record, sandbox) => {
  const payload = { ...record, __model: sandbox.model.id };

  cache.namespaces.core.messageBus.publish('service:reload_record_cache', {
    target: 'records',
    params: { action, payload: payload }
  });
};

export default {
  after_insert: [ reloadCache('insert') ],
  after_update: [ reloadCache('update') ],
  after_delete: [ reloadCache('delete') ],
};
