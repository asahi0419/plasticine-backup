/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const server_script = `const { currentPassword, password }  = p.getRequest();
const account = p.currentUser.getAccount();

try {
  await account.changePassword(currentPassword, password);
  p.actions.logout({ message: p.translate('static.password_successfully_changed'), redirect : '/pages/login'});
} catch (error) {
  p.response.error(error);
}`;

  await knex(table).where({ alias: 'submit_changed_password' }).update({ server_script });
};

export const up = (knex) => {
  return onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
