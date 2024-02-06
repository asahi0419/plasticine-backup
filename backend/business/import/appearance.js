import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const appearances = await db.model('appearance').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const appearancesMap = keyBy(appearances, 'alias');

  return Promise.map(records, (record) => {
    if (!appearancesMap[record.name]) {
      return db.model('appearance', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
