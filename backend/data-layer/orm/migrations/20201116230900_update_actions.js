/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'action', { alias: 'form_metadata' }, { on_insert: true, on_update: true });
  await HELPERS.updateRecord(knex, 'action', { alias: 'save', type: 'context_menu' }, { on_insert: true });
  await HELPERS.deleteRecord(knex, 'action', { alias: 'save', type: 'context_menu', model: models.user.id });
};

export const up = (knex) => {
  const models = ['model', 'user', 'action'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
