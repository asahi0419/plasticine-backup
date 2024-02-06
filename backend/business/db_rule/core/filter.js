import cache from '../../../presentation/shared/cache/index.js';

const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'filters',
    params: { action, payload },
  });
}

export default {
  after_insert:[reloadCache('insert')],
  after_update:[reloadCache('update')],
  after_delete: [reloadCache('delete')],
};
