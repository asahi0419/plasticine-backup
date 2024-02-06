/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  await HELPERS.updateRecord(knex, 'action', { type: 'form_group' }, { type: 'group' });
  await HELPERS.updateRecord(knex, 'action', { type: 'view_group' }, { type: 'group' });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
