/* eslint-disable */

import Promise from 'bluebird';
import { keys } from 'lodash-es';

import { onModelExistence } from './helpers/index.js';

const SCRIPTS = {
  create_and_verify_email: `const { email, password } = p.getRequest();

try {
  const token = p.encryptor.encrypt(email);
  const process = 'create_account';
  const account = await helpers.auth.createAccount(email, password);

  await account.sendSecurityCode('email confirmation');
  await account.update({ status: 'waiting_confirmation' });

  p.actions.openPage('email_confirmation', { token, process });
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  check_security_code: `const request = p.getRequest();
const { token, security_code, process } = request;

try {
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);

  await account.validateSecurityCode(security_code, request);
  await account.update({ status: 'active' });

  await helpers.auth.authenticate(account, request);
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  resend_security_code: `const { token, process } = p.getRequest();

try {
  const email = p.encryptor.decrypt(token);
  const account = await helpers.auth.findAccountByEmail(email);
  const subject = (process === 'password_recovery') ? 'password recovery' : 'email confirmation';

  await account.sendSecurityCode(subject);
  p.actions.openPage('email_confirmation', { token, process });
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  auth_user: `const request = p.getRequest();
const { email, password } = request;

try {
  const user = await p.authUser(email, password);
  const account = user.getAccount();
  const confirmation = (account.getValue('status') === 'waiting_confirmation');

  if (!confirmation) return helpers.auth.authenticate(account, request);

  const token = p.encryptor.encrypt(email);
  const process = 'waiting_confirmation';

  p.actions.openPage('email_confirmation', { token, process });
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  check_email: `const { email } = p.getRequest();

try {
  const account = await helpers.auth.findAccountByEmail(email);
  await account.sendSecurityCode('password recovery');

  const token = p.encryptor.encrypt(email);
  const process = 'password_recovery';

  p.actions.openPage('setup_new_password', { token, process });
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  apply_new_password: `const request = p.getRequest();
const { email, password, security_code } = request;

try {
  const account = await helpers.auth.findAccountByEmail(email);
  await account.validateSecurityCode(security_code, request);
  await account.update({ password });

  await helpers.auth.authenticate(account, request);
} catch (error) {
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
