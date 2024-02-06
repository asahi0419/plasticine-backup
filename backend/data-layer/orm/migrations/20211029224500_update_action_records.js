/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const records = await HELPERS.getRecords(knex, 'action', { type: 'group' });

  await Promise.each(records, async (r) => {
    await HELPERS.updateRecord(knex, 'action', { id: r.id }, {
      group: true,
      client_script: null,
      condition_script: null,
      server_script: null,
      type: r.on_update || r.on_insert ? 'form_button' : 'view_button',
    });
  });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
