/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/24-settings.js';

const migrate = (knex) => async (models) => {
  const seed = find(SEED.records, { alias: 'data_store_periods' }) || { value: {} };
  const record = await HELPERS.getRecord(knex, 'setting', { alias: seed.alias });

  if (record) {
    const value = JSON.stringify({ ...seed.value, ...JSON.parse(record.value) });
    await HELPERS.updateRecord(knex, 'setting', { id: record.id }, { value });
  }
};

export const up = (knex) => {
  const models = ['model', 'setting'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
