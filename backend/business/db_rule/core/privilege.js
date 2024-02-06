import { pick, map } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import cache from '../../../presentation/shared/cache/index.js';

const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'privileges',
    params: { action, payload },
  });
}

const processTemplatePrivileges = async (privilege, action) => {
  const attributes = pick(privilege, ['level', 'owner_type', 'owner_id']);

  const dvfFields = db.getFields({ model: privilege.model, type: 'data_visual' });
  const dataModels = await db.model('t_cross').distinct().pluck('data_model_id').whereIn('dvf_field_id', map(dvfFields, 'id'));

  const privileges = (action === 'insert')
    ? map(dataModels, model => ({ ...attributes, model }))
    : await db.model('privilege').pluck('id').where({ ...attributes }).whereIn('model', dataModels);

  return (action === 'insert')
    ? db.model('privilege').insert(privileges)
    : db.model('privilege').whereIn('id', privileges).delete();
}

const extendChildPrivileges = async (privilege) => {
  await processTemplatePrivileges(privilege, 'insert')
};

const reduceChildPrivileges = async (privilege) => {
  await processTemplatePrivileges(privilege, 'delete')
};

export default {
  after_insert: [reloadCache('insert'), extendChildPrivileges],
  after_update: [reloadCache('update'), extendChildPrivileges],
  after_delete: [reloadCache('delete'), reduceChildPrivileges],
};
