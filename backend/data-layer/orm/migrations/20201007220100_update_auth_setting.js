/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' }) || {};
  const value = JSON.parse(record.value || '{}');

  value.service_account_button = {
    enabled: false,
    name: 'Service account',
    icon: 'user',
  };
  value.azure_sso = {
    enabled: false,
    name: 'Log in with Azure',
    icon: 'windows',
    params: {},
  };
  value.google_sso = {
    enabled: false,
    name: 'Log in with Google',
    icon: 'google',
    params: {},
  };

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'authorization' },
    { value: JSON.stringify(value) }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
