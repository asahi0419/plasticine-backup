/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' }) || {};
  const value = JSON.parse(record.value || '{}');

  if (value.sso && value.sso.strategies) {
    value.sso.strategies.custom = {
      enabled: false,
      name: 'Log in over SSO',
      icon: 'lock',
      params: {
        clientID: 'please_specify',
        clientSecret: 'please_specify',
        getCodeUrl: 'please_specify',
        getTokenUrl: 'please_specify',
      },
    };
  };

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'authorization' },
    { value: JSON.stringify(value) }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
