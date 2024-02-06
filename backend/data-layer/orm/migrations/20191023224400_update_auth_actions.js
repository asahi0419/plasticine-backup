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

  await account.validateSecurityCode(security_code, request, { ip_ban: { type: 'registration_security_code_protection' } });
  await account.update({ status: 'active' });

  await helpers.auth.authenticate(account, request);
} catch (error) {
  p.response.error(error);
}`,
// ============================================================================
  check_email: `const { email } = p.getRequest();

try {
  const account = await helpers.auth.findAccountByEmail(email, { ip_ban: { type: 'password_recovery_email_protection' } });
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
  await account.validateSecurityCode(security_code, request, { ip_ban: { type: 'password_recovery_security_code_protection' } });
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
