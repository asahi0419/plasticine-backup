/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrateUIRules = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'ui_rule', { model: models.field.id, name: 'Set date formats on change' });
  await HELPERS.deleteRecord(knex, 'ui_rule', { model: models.field.id, name: 'Set date formats on load' });
};

const migrate = (knex) => async (models) => {
  await migrateUIRules(knex, models);
};

export const up = (knex) => {
  const models = ['field', 'ui_rule'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
