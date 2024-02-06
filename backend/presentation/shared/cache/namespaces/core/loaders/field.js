import { keyBy, map } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

const actionMap = {
  insert: (items, payload) => {
    items[payload.id] = payload;
    return items;
  },
  update: (items, payload) => {
    items[payload.id] = payload;
    return items;
  },
  delete: (items, payload) => {
    delete items[payload.id];
    return items;
  }
};

export default async (items = {}, params = {}) => {
  const { action, payload = {} } = params;

  if (action) return actionMap[action](items, payload);

  const models = params.models || db.getModels({ __inserted: true });
  const modelsIds = map(models, 'id');
  const records = await db.model('field').where({ __inserted: true }).whereIn('model', modelsIds);

  items = keyBy(records, 'id');

  return items;
};
