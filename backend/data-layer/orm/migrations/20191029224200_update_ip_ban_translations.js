/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.deleteRecord(knex, 'static_translation', { key: 'user_status_banned_error_reason' });
  await HELPERS.deleteRecord(knex, 'static_translation', { key: 'wrong_credentials_will_ban' });
  await HELPERS.deleteRecord(knex, 'static_translation', { key: 'wrong_credentials_is_ban' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
