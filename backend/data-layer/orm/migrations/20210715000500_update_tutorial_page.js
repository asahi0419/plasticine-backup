/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const page = await HELPERS.getRecord(knex, 'page', { alias: 'tutorial' });
  if (!page) return;

  const seed = find(SEED.records, { alias: 'tutorial' }) || {};
  await HELPERS.updateRecord(knex, 'page',
    { alias: 'tutorial' },
    pick(seed, ['alias', 'name', 'access_script', 'server_script', 'component_script', 'template', 'styles'])
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
