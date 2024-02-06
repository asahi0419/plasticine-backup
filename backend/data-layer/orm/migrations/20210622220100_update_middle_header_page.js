/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const page = await HELPERS.getRecord(knex, 'page', { alias: 'middle_header' });
  if (!page) return;

  const seed = find(SEED.records, { alias: 'middle_header' }) || {};

  const leftHeaderPage = await HELPERS.getRecord(knex, 'page', { alias: 'left_header' });
  if (leftHeaderPage) {
    const match = leftHeaderPage.template.match('name="(.[^"]+)"');
    if (match) seed.template = seed.template.replace('block layout', match[1] || 'block layout');
  }

  await HELPERS.updateRecord(knex, 'page',
    { alias: 'middle_header' },
    pick(seed, ['alias', 'name', 'access_script', 'server_script', 'component_script', 'template', 'styles'])
  );
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
