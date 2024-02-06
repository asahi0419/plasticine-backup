import cache from '../../../presentation/shared/cache/index.js';

export const reloadTranslations = (payload, sandbox) => {
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'translations', params: { payload } });
}

export default {
  after_insert: [reloadTranslations],
  after_update: [reloadTranslations],
  after_delete: [reloadTranslations],
};
