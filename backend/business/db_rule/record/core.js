import { map, find } from 'lodash-es';

import cache from '../../../presentation/shared/cache/index.js';
import db from '../../../data-layer/orm/index.js';

const SYNCHRONIZED_MODELS = [ 'mc_custom_sync' ];

const checkAvailability = modelAliases => map(modelAliases, model => db.getModel(model));

export const reloadCache = (action) => async (record, sandbox) => {
  let synchronizedModels;

  try {
    synchronizedModels = checkAvailability(SYNCHRONIZED_MODELS);
  } catch (err) { // it`s can happen while seeding
  }

  if (!find(synchronizedModels, model => model.id === sandbox.model.id)) return;

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
