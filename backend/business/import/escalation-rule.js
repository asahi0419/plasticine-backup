import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const escalationRules = await db.model('escalation_rule').where({ model: model.id }).whereIn('name', map(records, 'name'));
  const escalationRulesMap = keyBy(escalationRules, 'name');

  return Promise.map(records, async (record) => {
    if (!escalationRulesMap[record.name]) {
      const field = db.getField({ model: model.id, alias: record.target_field }) || {};
      const extendedAttributes =  field ? { target_field: field.id } : {};

      return db.model('escalation_rule', sandbox)
        .createRecord({ ...record, ...extendedAttributes, model: model.id }, mode !== 'seeding');
    }
  });
};
