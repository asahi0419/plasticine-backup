import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', async (model) => {
    await HELPERS.updateRecord(knex, 'action', { alias: 'check_email' }, {
      server_script: `const { email } = p.getRequest();

try {
  const account = await helpers.auth.findAccountByEmail(email, { ip_ban: { type: 'password_recovery_email_protection' } });

  const etoken = p.encryptor.encrypt(email);
  await account.sendSecurityCode('password recovery', etoken);
  const process = 'password_recovery';

  p.actions.openPage('setup_new_password', { etoken, process });
} catch (error) {
  p.response.error(error);
}`
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
