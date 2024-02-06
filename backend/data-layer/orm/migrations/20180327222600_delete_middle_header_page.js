/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = (knex, Promise) => {
  return knex(getTableName({ id: 6, type: 'core' })).where({ alias: 'middle_header' }).del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
