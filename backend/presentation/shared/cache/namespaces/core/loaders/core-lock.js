import { omit, isNull, keyBy, map, each } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

export default async (items = {}, params = {}) => {
  const { action, payload = {} } = params;

  if (action) {
    if (action === 'delete') {
      delete items[payload.id];
    } else {
      const item = omit(payload, ['id']);
      if (isNull(item.field_update)) delete item.field_update;
      items[payload.id] = item;
    }
  } else {
    const models = params.models || db.getModels({ __inserted: true });
    const modelsIds = map(models, 'id');
    const records = await db.model('core_lock').select('id', 'model', 'record_id', 'update', 'delete', 'field_update').where({ __inserted: true }).whereIn('model', modelsIds);

    items = keyBy(records, 'id');
    each(items, (item) => {
      if (isNull(item.field_update)) delete item.field_update;
      delete item.id;
    });
  }

  return items;
};
