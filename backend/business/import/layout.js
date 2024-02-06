import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const layouts = await db.model('layout').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const layoutsMap = keyBy(layouts, 'name');

  return Promise.map(records, (record) => {
    if (!layoutsMap[record.name]) {
      return db.model('layout', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
