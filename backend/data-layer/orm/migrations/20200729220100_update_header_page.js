/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const page = find(SEED.records, { alias: 'left_header' }) || {};

  await HELPERS.updateRecord(knex, 'page',
    { alias: 'header' },
    pick(page, ['alias', 'name', 'tepmlate', 'styles' ])
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
