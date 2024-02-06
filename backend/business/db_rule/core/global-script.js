import cache from '../../../presentation/shared/cache/index.js';

function reloadCache() {
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'global_scripts' });
}

export default {
  after_insert: [reloadCache],
  after_update: [reloadCache],
  after_delete: [reloadCache],
};
