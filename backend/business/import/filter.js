import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const filters = await db.model('filter').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const filtersMap = keyBy(filters, 'name');

  return Promise.map(records, (record) => {
    if (!filtersMap[record.name]) {
      return db.model('filter', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
