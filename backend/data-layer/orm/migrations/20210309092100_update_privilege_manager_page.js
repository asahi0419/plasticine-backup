/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const page = find(SEED.records, { alias: 'privilege_manager' }) || {};

  await HELPERS.updateRecord(knex, 'page',
    { alias: 'privilege_manager' },
    pick(page, ['component_script', 'server_script'])
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
