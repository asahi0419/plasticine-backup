/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = await HELPERS.getRecord(knex, 'setting', { alias: 'mailer' }) || {};
  const value = JSON.parse(record.value || '{}');

  value['type'] = 'smtp';

  await HELPERS.updateRecord(knex, 'setting',
    { alias: 'mailer' },
    { value: JSON.stringify(value) }
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
