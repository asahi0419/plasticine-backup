/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.deleteRecord(knex, 'static_translation', { key: 'export_maximum_cells_limit' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
