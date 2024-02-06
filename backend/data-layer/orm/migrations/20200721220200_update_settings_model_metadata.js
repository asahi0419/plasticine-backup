/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/24-settings.js';

const migrateFields = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { model: models.setting.id, alias: 'value' },
    { options: JSON.stringify(find(SEED.fields, { alias: 'value' }).options) }
  );
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'setting'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
