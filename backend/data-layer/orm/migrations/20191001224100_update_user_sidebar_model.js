/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'model',
    { id: models.user_sidebar.id },
    { access_script: 'true' });
};

export const up = (knex) => {
  const models = ['model', 'user_sidebar'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
