import Promise from 'bluebird';

import db from '../index.js';
import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async () => {
  const admin = await HELPERS.getRecord(knex, 'account', { email: process.env.APP_ADMIN_USER });
  if (!admin) return;

  const models = await HELPERS.getRecords(knex, 'model', { __inserted: true });
  await Promise.each(models, async (m) => {
    const acp = await HELPERS.getRecord(knex, 'permission', {
      model: m.id,
      type: 'attachment',
      action: 'create_photo',
    });

    if (!acp) {
      const record = await HELPERS.createRecord(knex, 'permission', {
        model: m.id,
        type: 'attachment',
        action: 'create_photo',
        script: 'p.currentUser.canAtLeastRead()',
        created_at: new Date(),
        created_by: admin.id,
      })
      await HELPERS.createRecord(knex, 'core_lock', {
        model: db.getModel('permission').id,
        update: false,
        delete: true,
        record_id: record.id,
        created_by: admin.id,
        created_at: new Date(),
      });
    }
  });
};

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'permission', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
