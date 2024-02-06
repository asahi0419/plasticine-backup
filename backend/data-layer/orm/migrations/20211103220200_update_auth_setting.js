/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'authorization' }) || {};
  const value = JSON.parse(record.value || '{}');

  value['2fa'] = 'off';

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'authorization' },
    { value: JSON.stringify(value) }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
