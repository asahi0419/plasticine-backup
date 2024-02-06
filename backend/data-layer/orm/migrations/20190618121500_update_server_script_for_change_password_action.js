/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const server_script = `const { currentPassword, password }  = p.getRequest();
const account = p.currentUser.getAccount();

try {
  await account.changePassword(currentPassword, password);
  p.actions.openPage('login', { message: p.translate('static.password_successfully_changed') });
} catch (error) {
  p.response.error(error);
}`;

export const up = async (knex, Promise) => {
  const [actionModel] = await knex(modelsTableName).where({ alias: 'action' }).limit(1);

  return actionModel && knex(getTableName(actionModel)).where({ alias: 'submit_changed_password' }).update({ server_script });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
