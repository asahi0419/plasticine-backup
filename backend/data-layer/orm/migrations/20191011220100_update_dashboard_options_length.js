/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/30-dashboards.js';

const migrate = (knex) => async (models) => {
  const field = find(SEED.fields, { alias: 'options' });
  await HELPERS.updateRecord(knex, 'field',
    { model: models.dashboard.id, alias: 'options' },
    { options: JSON.stringify(field.options) });
};

export const up = (knex) => {
  const models = ['model', 'dashboard'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
