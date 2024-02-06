/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (m) => {
  const field = await HELPERS.getRecord(knex, 'field', { model: m.inventory_template.id, alias: 'subcategory' });
  const options = { foreign_model: 'inventory_subcategory', foreign_label: 'name' };
  await HELPERS.updateRecord(knex, 'field', { id: field.id }, { type: 'reference', options });
};

export const up = (knex) => {
  const models = ['inventory_template'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
