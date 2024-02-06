import db from '../../../../data-layer/orm/index.js';
import cache from '../../../../presentation/shared/cache/index.js';

export default async (model, recordIds) => {
  await db.model('core_lock').where({ model: model.id }).whereIn('record_id', recordIds).delete();
  cache.namespaces.core.messageBus.publish('service:reload_cache', { target: 'core_locks' });
};
