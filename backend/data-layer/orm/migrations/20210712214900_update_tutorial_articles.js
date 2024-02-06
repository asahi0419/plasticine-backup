/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const records = await knex(table);

  await Promise.each(records, async ({ id, path }) => {
    if ((path || '').startsWith('/page/')) {
      await HELPERS.updateRecord(knex, 'tutorial_article', { id }, { path: path.replace('/page/', '/pages/') });
    }
  });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'tutorial_article', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
