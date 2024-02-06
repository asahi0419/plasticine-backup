import { groupBy, map, filter } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

const actionMap = {
  insert: (items, payload) => {
    items[payload.model] = items[payload.model] || [];
    items[payload.model] = filter(items[payload.model], ({ id }) => id !== payload.id).concat(payload);

    return items;
  },
  update: function (items, payload) {
    return this.insert(items, payload);
  },
  delete: (items, payload) => {
    items[payload.model] = filter(items[payload.model], ({ id }) => id !== payload.id);

    return items;
  }
};

export default async (items, params = {}) => {
  const { action, payload = {} } = params;

  if (action) return actionMap[action](items, payload);

  const models = params.models || db.getModels({ __inserted: true });
  const modelsIds = map(models, 'id');
  const records = await db.model('permission').select('id', 'type', 'action', 'script', 'model', 'field').where({ __inserted: true }).whereIn('model', modelsIds);

  items = groupBy(records, 'model');

  return items;
};
