/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrateFields = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'core_lock');

  const hasColumn = {
    field_update: await knex.schema.hasColumn(tableName, 'field_update'),
  };

  !hasColumn.field_update && await knex.schema.table(tableName, (table) => table.integer('field_update'));

  await HELPERS.updateRecord(knex, 'field',
    { model: models.core_lock.id, alias: 'record_id' },
    { options: '{}', index: 'none' }
  );

  await knex.schema.table(tableName, (table) => {
    table.dropUnique(['model', 'record_id']);
  });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'form', 'core_lock'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
