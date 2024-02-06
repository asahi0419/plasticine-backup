/* eslint-disable */

import Promise from 'bluebird';
import { keys } from 'lodash-es';

import { onModelExistence } from './helpers/index.js';

const SCRIPTS = {
  check_security_code: `const request = p.getRequest();
const { token, security_code, process } = request;

try {
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);

  await account.validate('security_code', security_code, { ...request, ip_ban: { type: 'registration_security_code_protection' } });
  await account.update({ status: 'active' });

  await helpers.auth.authenticate(account);
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  apply_new_password: `const request = p.getRequest();
const { email, password, security_code } = request;

try {
  const account = await helpers.auth.findAccountByEmail(email);
  await account.validate('security_code', security_code, { ...request, ip_ban: { type: 'password_recovery_security_code_protection' } });
  await account.update({ password });

  await helpers.auth.authenticate(account);
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  auth_user: `const params = p.getRequest();
const account = p.currentUser.getAccount();

try {
  if (params.otp_token) {
    await account.validate('otp_token', params.otp_token);
    await account.validate('otp_code', params.otp_code);
    await account.ensure('2fa_activated');

    return helpers.auth.authenticate(account);
  }

  const authUser = await p.authUser(params.email, params.password);
  const authAccount = authUser.getAccount();

  if (await authAccount.getLoginType() === 'otp') {
    await authAccount.ensure('2fa_code');

    return p.response.json({
      type: 'otp',
      token: await authAccount.getOtpToken(),
      activated: authAccount.getValue('2fa_activated'),
    });
  }

  if (authAccount.getValue('status') === 'waiting_confirmation') {
    return p.actions.openPage('email_confirmation', {
      token: p.encryptor.encrypt(params.email),
      process: 'waiting_confirmation',
    });
  }

  helpers.auth.authenticate(authAccount, params);
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
