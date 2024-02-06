/* eslint-disable */

import { keyBy } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/28-accounts.js';

const migrate = (knex) => async (models) => {
  const records = keyBy(SEED.forms, 'alias');

  if (records.default) {
    await HELPERS.updateRecord(knex, 'form',
      { model: models.account.id, alias: 'default' },
      { options: JSON.stringify(records.default.options) }
    );
  }
};

export const up = (knex) => {
  const models = ['model', 'form', 'account'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
