/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = (knex) => {
  return knex(getTableName({ id: 6, type: 'core' }))
    .where({ alias: 'left_menu' })
    .update({ alias: 'system_sidebar', name: 'System sidebar' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
