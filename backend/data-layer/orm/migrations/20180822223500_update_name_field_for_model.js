/* eslint-disable */

import getTableName from './helpers/table-name.js';

const fieldTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  await knex(fieldTableName).where({ model: 1, alias: 'name' }).update({ name: 'Name (singular)' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
