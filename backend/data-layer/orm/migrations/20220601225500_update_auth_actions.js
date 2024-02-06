/* eslint-disable */

import Promise from 'bluebird';
import { keys } from 'lodash-es';

import { onModelExistence } from './helpers/index.js';

const SCRIPTS = {
// ============================================================================
  auth_user: `const request = p.getRequest();
const account = p.currentUser.getAccount();

try {
  if (request.otp_token) {
    await account.validate('otp_token', request.otp_token);
    await account.validate('otp_code', request.otp_code);
    await account.ensure('two_fa_activated');

    return helpers.auth.authenticate(account);
  }

  const authUser = await p.authUser(request.email, request.password);
  const authAccount = authUser.getAccount();

  if (request.client === 'mobile') {
    await helpers.auth.checkMcDevice(request, authUser.user)
  }

  if (await authAccount.getLoginType() === 'otp') {
    await authAccount.ensure('two_fa_code');

    return p.response.json({
      type: 'otp',
      token: await authAccount.createOtpToken(),
      activated: authAccount.getValue('two_fa_activated'),
    });
  }

  if (authAccount.getValue('status') === 'waiting_confirmation') {
    return p.actions.openPage('email_confirmation', {
      token: p.encryptor.encrypt(request.email),
      process: 'waiting_confirmation',
    });
  }

  helpers.auth.authenticate(authAccount, request);
} catch (error) {
  p.log.error(error);
  p.response.error(error);
}`,
};

const migrate = (knex) => async (model, table) => {
  await Promise.each(keys(SCRIPTS), (alias) =>
    knex(table).where({ alias }).update({ server_script: SCRIPTS[alias] }));
};

export const up = (knex) => {
  return onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
