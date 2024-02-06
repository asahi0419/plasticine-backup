/* eslint-disable */

import { onModelExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (model, table) => {
  const [wsModel] = await knex(getTableName({ id: 1, type: 'core' })).where({ alias: 'web_service' }).limit(1);
  if (!wsModel) return;
  return knex(table).where({ model: wsModel.id, name: 'Default' }).delete();
}

export const up = (knex) => {
  return onModelExistence(knex, 'filter', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
