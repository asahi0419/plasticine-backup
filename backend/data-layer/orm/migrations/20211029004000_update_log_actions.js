/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const attributes = { model: models.log.id, alias: 'mc_create' };
  await HELPERS.deleteRecord(knex, 'action', attributes);
};

export const up = (knex) => {
  const models = ['model', 'action', 'log'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
