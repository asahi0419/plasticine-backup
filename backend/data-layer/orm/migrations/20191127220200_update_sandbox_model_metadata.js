/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/45-sandboxes.js';

const migrateModel = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'model',
    { id: models.sandbox.id },
    { plural: SEED.plural }
  );
};

const migrateFields = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { model: models.sandbox.id, alias: 'script' },
    { options: JSON.stringify(find(SEED.fields, { alias: 'script' }).options) }
  );
};

const migrateForms = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'form',
    { model: models.sandbox.id, name: 'Default' },
    { options: JSON.stringify(find(SEED.forms, { alias: 'default' }).options) }
  );
};

const migrate = (knex) => async (models) => {
  await migrateModel(knex, models);
  await migrateFields(knex, models);
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'form', 'sandbox'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
