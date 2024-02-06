/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'field',
    { alias: 'template', model: models.page.id },
    { options: find(SEED.fields, { alias: 'template' }).options }
  );
};

export const up = (knex) => {
  const models = ['field', 'page'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
