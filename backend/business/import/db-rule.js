import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const dbRules = await db.model('db_rule').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const dbRulesMap = keyBy(dbRules, 'name');

  return Promise.map(records, (record) => {
    if (!dbRulesMap[record.name]) {
      return db.model('db_rule', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
