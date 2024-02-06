/* eslint-disable */

import THEMES from '../seeds/settings/themes.js';
import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const clause = { alias: 'themes' };
  const attributes = { value: THEMES };

  await knex(table).where(clause).update(attributes);
}

export const up = (knex) => {
  return onModelExistence(knex, 'setting', migrate(knex));
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
