/* eslint-disable */

import { find } from 'lodash-es';

import SEED from '../seeds/24-settings.js';
import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const record = find(SEED.records, { alias: 'extensions' });
  const clause = { alias: 'plugins' };

  await HELPERS.updateRecord(knex, 'setting', clause,
    { ...record, value: JSON.stringify(record.value) });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
