/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const columns = {
    group: await knex.schema.hasColumn(table, 'group'),
  };

  if (!columns.group) {
    await knex.schema.table(table, (t) => {
      t.boolean('group').defaultTo(false);
    });
  }
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
