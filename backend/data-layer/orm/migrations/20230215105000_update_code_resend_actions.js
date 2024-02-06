import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/pages/auth/setup-new-password.js';

export const up = async (knex) => {
  await HELPERS.onModelExistence(knex, 'action', async (model) => {
    const actions = SEED.actions;
    await Promise.each(actions, async (r={}) =>{

      await HELPERS.updateRecord(knex, model.alias, { alias: r.alias }, {
        server_script: r.server_script,
      });
    });
  });
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};