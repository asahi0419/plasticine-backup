/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/13-permissions.js';

const migrate = (knex) => async (models) => {
  const field = find(SEED.fields, { alias: 'action' });
  await HELPERS.updateRecord(knex, 'field',
    { model: models.permission.id, alias: 'action' },
    { options: JSON.stringify(field.options) });
};

export const up = (knex) => {
  const models = ['model', 'field', 'permission'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
