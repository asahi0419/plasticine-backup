/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: "Kill active user's session if password has changed" }).delete();
};

export const up = (knex) => {
  return onModelExistence(knex, 'db_rule', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
