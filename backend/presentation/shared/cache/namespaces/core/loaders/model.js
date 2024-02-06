import db from '../../../../../../data-layer/orm/index.js';

const actionMap = {
  insert: (items, payload) => {
    items[payload.id] = items[payload.alias] = payload;
    return items;
  },
  update: (items, payload) => {
    items[payload.id] = items[payload.alias] = payload;
    return items;
  },
  delete: (items, payload) => {
    delete items[payload.id];
    delete items[payload.alias];
    return items;
  }
};

export default async (items, params = {}, mode = 'async') => {
  const { action, payload = {} } = params;

  if (action) return actionMap[action](items, payload);

  const models = await db.client(db.model('model').tableName).where({ __inserted: true });

  return models.reduce((result, model) => {
    result[model.id] = result[model.alias] = model;
    return result;
  }, {});
};
