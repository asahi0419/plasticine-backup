/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import passwordRecoveryPage from '../seeds/pages/auth/password-recovery.js';

export const up = async (knex) => {
  const actions = passwordRecoveryPage.actions
  await Promise.each(actions, async ({ alias, server_script }) => {
    await HELPERS.updateRecord(knex, 'action', { alias }, { server_script });
  });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};