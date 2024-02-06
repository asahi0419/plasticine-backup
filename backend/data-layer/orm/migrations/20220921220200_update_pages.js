/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.deleteRecord(knex, 'page',
    { alias: 'form_manager' }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
