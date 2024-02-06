import cache from '../../../presentation/shared/cache/index.js'

const reloadTranslations = (action) => (record) => {  
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'json_translations', params: { action, payload: record }});
}

export default {
  after_insert: [reloadTranslations('insert')],
  after_update: [reloadTranslations('update')],
  after_delete: [reloadTranslations('delete')]
};
