/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/28-accounts.js';

const migrateForms = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'form',
    { model: models.account.id, name: 'Default' },
    { options: JSON.stringify(find(SEED.forms, { alias: 'default' }).options) }
  );
};

const migrate = (knex) => async (models) => {
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'form', 'account'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
