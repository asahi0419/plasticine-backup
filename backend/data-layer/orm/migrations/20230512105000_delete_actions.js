/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const actionsTableName = await HELPERS.getModelTableName(knex, 'action')

  await knex(actionsTableName).where({ alias: 'map_draw' }).delete();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
