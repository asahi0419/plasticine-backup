/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const updateUserAction = (knex, actionModelTable) => async (model) => {
  const clause = { alias: 'change_password', model: model.id };
  const attributes = { condition_script: 'p.record.getValue("id") === (p.currentUser.getValue("id"))' };

  await knex(actionModelTable).where(clause).update(attributes);
}

const migrate = (knex) => async (model, table) => {
  return onModelExistence(knex, 'user', updateUserAction(knex, table));
}

export const up = (knex) => {
  return onModelExistence(knex, 'action', migrate(knex));
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
