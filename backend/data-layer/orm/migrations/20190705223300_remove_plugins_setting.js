/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  return knex(table).where({ alias: 'plugins' }).delete();
}

export const up = (knex) => {
  return onModelExistence(knex, 'setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
