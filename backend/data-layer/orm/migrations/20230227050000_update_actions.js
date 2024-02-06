import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import setupNewPasswordPage from '../seeds/pages/auth/setup-new-password.js';
import passwordRecovery from '../seeds/pages/auth/password-recovery.js';

export const up = async (knex) => {
  const pages = {
    'setup-new-password': setupNewPasswordPage,
    'password-recovery': passwordRecovery,
  };
  await Promise.each(Object.keys(pages), async (pageName) => {
    const actions = pages[pageName].actions;

    await Promise.each(actions, async ({ alias, server_script }) => {
      await HELPERS.updateRecord(knex, 'action', { alias }, { server_script });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};