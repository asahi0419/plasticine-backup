/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/40-scheduled-tasks.js';

const migrateFields = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { model: models.scheduled_task.id, alias: 'reenable_every' },
    { hidden_when_script: find(SEED.fields, { alias: 'reenable_every' }).hidden_when_script }
  );
  await HELPERS.updateRecord(knex, 'field',
    { model: models.scheduled_task.id, alias: 'reenable_end' },
    { hidden_when_script: find(SEED.fields, { alias: 'reenable_end' }).hidden_when_script }
  );
  await HELPERS.updateRecord(knex, 'field',
    { model: models.scheduled_task.id, alias: 'end_by_count' },
    { required_when_script: find(SEED.fields, { alias: 'end_by_count' }).required_when_script }
  );
  await HELPERS.updateRecord(knex, 'field',
    { model: models.scheduled_task.id, alias: 'end_by_date' },
    { required_when_script: find(SEED.fields, { alias: 'end_by_date' }).required_when_script }
  );
};

const migrateForms = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'form',
    { model: models.scheduled_task.id, name: 'Default' },
    { options: JSON.stringify(find(SEED.forms, { alias: 'default' }).options) }
  );
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'form', 'scheduled_task'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
