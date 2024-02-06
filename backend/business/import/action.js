import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const actions = await db.model('action').where({ model: model.id }).whereIn('alias', map(records, 'alias'));
  const actionsMap = keyBy(actions, 'alias');

  return Promise.map(records, (record) => {
    if (!actionsMap[record.alias]) {
      return db.model('action', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
