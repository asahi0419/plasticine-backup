/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.deleteRecord(knex, 'setting', { alias: 'del_ip_bans_history_after_days' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
