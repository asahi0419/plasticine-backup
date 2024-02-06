/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  const [stModel] = await knex(getTableName({ id: 1, type: 'core' })).where({ alias: 'static_translation' }).limit(1);
  if (!stModel) return;

  return knex(getTableName(stModel)).where({ key: 'add_widget_on_dashboard' }).del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
