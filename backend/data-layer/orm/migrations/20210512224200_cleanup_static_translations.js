/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.deleteRecord(knex, 'static_translation', { key: 'rotate_reset_bearing_to_north' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
