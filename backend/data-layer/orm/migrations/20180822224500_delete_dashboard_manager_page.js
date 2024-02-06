/* eslint-disable */

import getTableName from './helpers/table-name.js';

const pageTableName = getTableName({ id: 6, type: 'core' });

export const up = async (knex) => {
  return knex(pageTableName).where({ alias: 'dashboard_manager' }).del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
