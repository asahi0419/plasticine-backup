import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js'

const reloadTranslations = (action) => (record) => {
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'dynamic_translations', params: { action, payload: record }});
}

async function updateTranslated(fieldId, state) {
  await db.model('field').where({ id: fieldId }).update({ __translated: state })

  const field = db.getField({ id: fieldId })

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'fields',
    params: { action: 'update', payload: { ...field, __translated: state } },
  });
}

const markFieldAsTranslated = async (translation) => updateTranslated(translation.field, true);
const markFieldAsNotTranslated = async (translation) => updateTranslated(translation.field, false);

export default {
  after_insert: [reloadTranslations('insert')],
  after_update: [markFieldAsTranslated, reloadTranslations('update')],
  after_delete: [markFieldAsNotTranslated, reloadTranslations('delete')]
};
