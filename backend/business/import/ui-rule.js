import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const uiRules = await db.model('ui_rule').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const uiRulesMap = keyBy(uiRules, 'name');

  return Promise.map(records, (record) => {
    if (!uiRulesMap[record.name]) {
      return db.model('ui_rule', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
