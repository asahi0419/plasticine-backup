/* eslint-disable */

import getTableName from './helpers/table-name.js';

const CHECK_SECURITY_CODE_SERVER_SCRIPT = `const request = p.getRequest();
const { token, security_code, process } = request;
const { createSession, sendResponse } = authHelpers;
const email = p.encryptor.decrypt(token)

try {
  const accountModel = await p.getModel('account');
  const userModel = await p.getModel('user');
  accountModel.setOptions({ check_permission: false });
  userModel.setOptions({ check_permission: false });

  const account = await accountModel.findOne({ email });
  const user = account ? await userModel.findOne({ account: account.id }) : undefined;

  if (!account || !user) {
    throw new Error(p.translate('email_is_not_registered', { defaultValue: 'Invalid credentials. Please try again' }));
  };

  if (account.getValue('security_code') !== security_code) {
    throw new Error(p.translate('code_is_not_valid', { defaultValue: 'The entered code is not valid. Please check your email and try again' }));
  }

  switch (process) {
    case 'password_recovery':
      return p.actions.openPage('setup_new_password', { token });
    case 'create_account':
    case 'waiting_confirmation':
      account.assignAttributes({ status: 'active' });
      await account.save();

      const userObject = await p.getUserObject(user);
      const session = await createSession(request, userObject);

      return sendResponse(session, userObject);
  }
} catch (error) {
  p.response.error(error);
}`;

const actionsTableName = getTableName({ id: 5, type: 'core' });

export const up = async (knex) => {
  await knex(actionsTableName).where({ alias: 'check_security_code' }).update({ server_script: CHECK_SECURITY_CODE_SERVER_SCRIPT });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
