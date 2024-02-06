/* eslint-disable */

import getTableName from './helpers/table-name.js';

const actionsTableName = getTableName({ id: 5, type: 'core' });

export const up = async (knex) => {
  if (await knex.schema.hasColumn(actionsTableName, 'options')) return;
  
  return knex.schema.table(actionsTableName, table => table.text('options'));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};