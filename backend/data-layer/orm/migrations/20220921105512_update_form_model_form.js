import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'form', async (model) => {
    await HELPERS.updateRecord(knex, 'form', { model: model.id, alias: 'default' }, { page: null })
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
