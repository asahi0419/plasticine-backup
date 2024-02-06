/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' }) || {};
  const value = JSON.parse(record.value || '{}');

  if (value.sso && value.sso.strategies) {
    value.sso.strategies.custom_saml2 = {
      enabled: false,
      name: 'Log in over SSO SAML2',
      icon: 'lock',
      params: {
        entryPoint: 'please_specify',
        cert: 'please_specify',
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
