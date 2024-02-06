/* eslint-disable */

import * as HELPERS from './helpers/index.js';
import { find, pick } from 'lodash-es';
import SEED from '../seeds/06-pages.js';

export const up = async (knex, Promise) => {
  const page = find(SEED.records, { alias: 'setup_new_password' }) || {};

  await HELPERS.updateRecord(
    knex,
    'page',
    { alias: 'setup_new_password' },
    pick(page, [
      'alias',
      'name',
      'access_script',
      'server_script',
      'component_script',
      'template',
      'styles',
    ])
  );
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
