/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  return knex(getTableName({ id: 7, type: 'core' }))
    .where({ name: "Kill active user's session if password has changed" })
    .update({ script: `const userModel = await p.getModel('user');
userModel.setOptions({ check_permission: false });

const user = await userModel.findOne({ account: p.record.getValue('id') });
const userObject = await p.getUserObject(user);

return userObject.getAccount().closeActiveSessions({ reason_to_close: 'auto' });` });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
