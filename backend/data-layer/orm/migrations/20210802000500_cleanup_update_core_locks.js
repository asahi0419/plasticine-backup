/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const models = await HELPERS.getRecords(knex, 'model', { type: 'core' });
  await Promise.each(models, async (model) => {
    await HELPERS.updateRecord(knex, 'core_lock', { update: true }, { update: false });
  });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
