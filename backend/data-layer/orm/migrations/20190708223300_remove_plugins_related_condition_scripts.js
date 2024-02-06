/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  return knex(table).whereIn('alias', ['inventory_template', 'inventory_category', 'inventory_subcategory']).update({ access_script: 'p.currentUser.canAtLeastRead()' });
}

export const up = (knex) => {
  return onModelExistence(knex, 'model', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
