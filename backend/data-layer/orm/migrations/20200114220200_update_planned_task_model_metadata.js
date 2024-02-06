/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/17-planned-tasks.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateFields = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'planned_task');

  await HELPERS.updateRecord(knex, 'field', { model: models.planned_task.id, name: 'Timeout attempts' }, { name: `Timeout counter` });
  await HELPERS.updateRecord(knex, 'field', { model: models.planned_task.id, alias: 'timeout_attempts' }, { alias: `timeout_counter` });
  await HELPERS.updateRecord(knex, 'field', { model: models.planned_task.id, alias: 'timeout_counter' }, { options: JSON.stringify({ default: 0 }) });
  await HELPERS.updateRecord(knex, 'field', { model: models.planned_task.id, alias: 'status' }, { options: JSON.stringify({
    values: {
      new: 'New',
      enqueued: 'Enqueued',
      in_progress: 'In progress',
      completed: 'Completed',
      error: 'Error',
      timeout_error: 'Timeout error',
      cancelled: 'Cancelled',
    },
    default: 'new',
    length: 2048,
  }) });

  const hasColumn = {
    timeout_attempts: await knex.schema.hasColumn(tableName, 'timeout_attempts'),
    timeout_counter: await knex.schema.hasColumn(tableName, 'timeout_counter'),
  };

  hasColumn.timeout_attempts && await knex.schema.table(tableName, (table) => table.dropColumn('timeout_attempts'));
  !hasColumn.timeout_counter && await knex.schema.table(tableName, (table) => table.integer('timeout_counter'));
};

const migrateForms = async (knex, models) => {
  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: models.planned_task.id, alias: 'default' });
  if (!defaultForm) return;

  const defaultFormOptions = parseOptions(defaultForm.options);
  const defaultSeedsForm = find(SEED.forms, { alias: 'default' });

  defaultFormOptions.components.list = defaultSeedsForm.options.components.list;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.planned_task.id, name: 'Default' },
    { options: JSON.stringify(defaultFormOptions) });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'form', 'planned_task'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
