/* eslint-disable */

import Promise from 'bluebird';
import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

export const up = async (knex) => {
  const aliases = ['setup_new_password'];

  await Promise.each(aliases, async (alias) => {
    const { server_script } = find(SEED.records, { alias }) || {};
    await HELPERS.updateRecord(knex, 'page', { alias }, { server_script });
  });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
