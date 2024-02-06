/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  await knex(table).where({ alias: 'system_sidebar' }).update({ access_script: '!p.currentUser.isGuest()' });
};

export const up = (knex) => {
  return onModelExistence(knex, 'page', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
