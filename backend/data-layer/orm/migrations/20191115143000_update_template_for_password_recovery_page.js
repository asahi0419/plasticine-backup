/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const { template } = find(SEED.records, { alias: 'password_recovery' }) || {};
  await HELPERS.updateRecord(knex, 'page', { alias: 'password_recovery' }, { template });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
