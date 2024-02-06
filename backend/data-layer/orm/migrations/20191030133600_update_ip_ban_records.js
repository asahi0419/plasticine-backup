/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrateFields = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'ip_ban');

  const hasColumn = {
    ban_type: await knex.schema.hasColumn(tableName, 'ban_type'),
  };

  !hasColumn.ban_type && await knex.schema.table(tableName, (table) => table.string('ban_type'));
};

const migrateRecords = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'ip_ban');
  const records = await knex(tableName);

  await Promise.each(records, async (record) => {
    if (!record.account) {
      await HELPERS.updateRecord(knex, 'ip_ban', { id: record.id }, { ban_type: 'ip' });
    }
  });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['ip_ban'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
