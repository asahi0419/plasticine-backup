import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', async (model) => {
    await HELPERS.updateRecord(knex, 'action', { alias: 'check_email' }, {
      condition_script: `p.getSetting('authorization.password.recovery')`
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
