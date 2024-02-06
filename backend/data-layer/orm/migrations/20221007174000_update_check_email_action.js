/* eslint-disable */

import * as HELPERS from './helpers/index.js';

export const up = async (knex, Promise) => {
  const clause = { alias: 'check_email' };

  const record = await HELPERS.getRecord(knex, 'action', clause);
  if (!record) return;

  const newServerScript = `
    const { email } = p.getRequest();

try {
  const accountProxy = await helpers.auth.findAccountByEmail(email, { ip_ban: { type: 'password_recovery_email_protection' } });

  const notAllowedStatuses = ['banned', 'disabled', 'inactive', 'waiting_confirmation', '']; 
  if(notAllowedStatuses.includes(accountProxy.getValue('status'))){
     throw new Error('Your account status has been suspended. Please contact system administrator for further instructions');  
  }
  
  const etoken = p.encryptor.encrypt(email);
  
  const gToken= p.encryptor.randomBytes()
  
  
  await accountProxy.sendSecurityCode('password recovery', etoken, gToken);
  const process = 'password_recovery';

  p.actions.openPage('setup_new_password', { etoken, process, gToken });
} catch (error) {
  p.response.error(error);
} 
    `;
  await HELPERS.updateRecord(knex, 'action', clause, {
    server_script: newServerScript,
  });
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
