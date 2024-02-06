/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const field = await HELPERS.getRecord(knex, 'field', { alias: 'multisession', model: models.account.id });
  if (!field) return;

  await HELPERS.updateRecord(knex, 'account', {}, { multisession: 'global' });
};

export const up = (knex) => {
  const models = ['model', 'field', 'account'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
