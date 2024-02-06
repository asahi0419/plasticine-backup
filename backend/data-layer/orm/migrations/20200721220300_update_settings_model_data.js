/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const updateAuthRecord = async (knex, models) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' });
  if (!record) return;

  const value = JSON.parse(record.value);
  delete value.ip_ban_brute;
  delete value.ip_ban_brute_attempts;
  delete value.by_levels;

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'authorization' },
    { value: JSON.stringify(value) }
  );
};

const deleteMultisessionRecord = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'setting', { alias: 'multisession' });
};

const deleteAutologoutRecord = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'setting', { alias: 'autologout_after_idle_min' });
};

const deletePeriodOfStoringSessionsRecord = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'setting', { alias: 'del_sessions_history_after_days' });
};

const migrateRecords = async (knex, models) => {
  await updateAuthRecord(knex, models);
  await deleteMultisessionRecord(knex, models);
  await deleteAutologoutRecord(knex, models);
  await deletePeriodOfStoringSessionsRecord(knex, models);
};

const migrate = (knex) => async (models) => {
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'setting'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
