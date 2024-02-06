import Promise from 'bluebird';
import { map, find, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records = [], context) => {
  const permissions = {
    other: records.filter((p = {}) => p.type !== 'field'),
    field: records.filter((p = {}) => p.type === 'field'),
  };

  await processOtherPermissions(permissions.other, context);
  await processFieldPermissions(permissions.field, context);
};

async function processOtherPermissions(records, context = {}) {
  const safety = context.mode !== 'seeding';
  const permissions = await db.model('permission')
    .where({ model: context.model.id })
    .whereIn('type', map(records, 'type')).whereIn('action', map(records, 'action'));

  const existMap = keyBy(permissions, (p = {}) => `${p.type}.${p.action}`);

  return Promise.map(records, (record) => {
    const exists = existMap[`${record.type}.${record.action}`];
    if (exists) return;

    const attributes = { ...record, model: context.model.id };
    return db.model('permission', context.sandbox).createRecord(attributes, safety);
  });
}

async function processFieldPermissions(records = [], context = {}) {
  const safety = context.mode !== 'seeding';
  const fields = await db.model('field').where({ model: context.model.id, __inserted: true });
  const permissions = await db.model('permission')
    .where({ model: context.model.id, type: 'field' })
    .whereIn('action', map(records, 'action'))
    .whereNotNull('field');

  permissions.forEach((r = {}) => {
    r.field = find(fields, { id: r.field });
  });

  records.forEach((r = {}) => {
    r.field = find(fields, (typeof r.field === 'object') ? r.field : { id: r.field });
  });

  const existMap = keyBy(permissions, (p = {}) => `${p.field.alias}.${p.action}`);

  return Promise.map(records, async (record) => {
    if (!record.field) return;

    const exists = existMap[`${record.field.alias}.${record.action}`];
    if (exists) await db.model('permission', context.sandbox).destroyRecord(exists, safety);

    const attributes = { ...record, model: context.model.id, field: record.field.id };
    return db.model('permission', context.sandbox).createRecord(attributes, safety);
  });
}
