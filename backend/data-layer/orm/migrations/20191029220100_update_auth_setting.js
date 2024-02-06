/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/24-settings.js';

export const up = async (knex) => {
  const { value } = find(SEED.records, { alias: 'authorization' }) || {};
  await HELPERS.updateRecord(knex, 'setting', { alias: 'authorization' }, { value: JSON.stringify(value) });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
