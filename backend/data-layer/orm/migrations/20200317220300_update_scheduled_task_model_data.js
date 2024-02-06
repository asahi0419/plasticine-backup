/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrateRecords = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'scheduled_task', { name: 'Session cleaner' }, { name: 'Session cleaner (Core)' });
  await HELPERS.updateRecord(knex, 'scheduled_task', { name: 'Ip Ban cleaner' }, { name: 'Ip Ban cleaner (Core)' });
};

const migrateCoreLocks = async (knex, models) => {
  const fields = await HELPERS.getRecords(knex, 'field', { model: models.scheduled_task.id });
  const records = [
    await HELPERS.getRecord(knex, 'scheduled_task', { name: 'Session cleaner (Core)' }),
    await HELPERS.getRecord(knex, 'scheduled_task', { name: 'Ip Ban cleaner (Core)' }),
  ];

  await Promise.each(records, async (record) => {
    if (!record) return;

    await Promise.each(fields, async (field) => {
      if (field.alias === 'active') return;
      await HELPERS.createRecord(knex, 'core_lock', {
        model: models.scheduled_task.id,
        record_id: record.id,
        field_update: field.id,
        update: false,
        delete: false,
        created_at: new Date(),
        created_by: 1,
      });
    });
  });
};

const migrate = (knex) => async (models) => {
  await migrateRecords(knex, models);
  await migrateCoreLocks(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'core_lock', 'scheduled_task'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
