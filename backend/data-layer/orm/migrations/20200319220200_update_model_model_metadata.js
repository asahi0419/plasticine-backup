/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/01-models.js';

const migrateUIRules = async (knex, models) => {
  const actionsVisibility = find(SEED.ui_rules, { name: 'Actions visibility' });
  await HELPERS.updateRecord(knex, 'ui_rule',
    { model: models.model.id, name: 'On change Type' },
    pick(actionsVisibility, ['name', 'type', 'script']));
};

const migrate = (knex) => async (models) => {
  await migrateUIRules(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'ui_rule'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
