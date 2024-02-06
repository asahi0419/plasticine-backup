/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ name: 'Authorization' }).delete();
};

export const up = (knex) => {
  return onModelExistence(knex, 'global_script', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
