/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  await HELPERS.updateRecord(knex, 'static_translation',
    { key: 'user_status_banned_error_reason' },
    {
      en: 'You are not allowed to proceed operation till {{till}}, because you IP is banned by reason: {{reason}}',
      uk: 'Вам не дозволяється розпочати роботу до {{till}}, оскільки ваш IP заблоковано з причини: {{reason}}',
    });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
