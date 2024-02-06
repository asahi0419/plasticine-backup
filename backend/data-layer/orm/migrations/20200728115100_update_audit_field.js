/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/02-fields.js';

const migrateAuditField = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { alias: 'audit', model: models.field.id },
    { readonly_when_script: find(SEED.fields, { alias: 'audit' }).readonly_when_script }
  );
};

const migrateRecords = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { type: 'journal' },
    { audit: 'none' }
  );
};

const migrate = (knex) => async (models) => {
  await migrateAuditField(knex, models);
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
