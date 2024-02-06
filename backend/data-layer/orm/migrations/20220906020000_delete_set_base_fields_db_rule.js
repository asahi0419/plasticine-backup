/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const clause = { name: 'Set base fields' };

  await knex(table).del().where(clause);
}

export const up = (knex) => {
  return onModelExistence(knex, 'db_rule', migrate(knex));
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
