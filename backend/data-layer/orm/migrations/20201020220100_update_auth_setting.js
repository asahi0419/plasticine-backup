/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' }) || {};
  const value = JSON.parse(record.value || '{}');

  value.sso = {
    create_user_if_no_exist: false,
    create_user_if_no_exist_with_group: ['__public'],
    strategies: {
      azure: {
        enabled: false,
        name: 'Log in with Azure',
        icon: 'windows',
        params: {
          identityMetadata: 'please_specify',
          clientID: 'please_specify',
          clientSecret: 'please_specify',
        },
      },
      google: {
        enabled: false,
        name: 'Log in with Google',
        icon: 'google',
        params: {
          clientID: 'please_specify',
          clientSecret: 'please_specify',
        },
      },
    },
  };

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'authorization' },
    { value: JSON.stringify(value) }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
