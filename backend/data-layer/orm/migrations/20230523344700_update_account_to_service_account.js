import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'account', async (model, table) => {
    const emails = [
      'mc_proxy_integration@free.man',
      'planned_task@free.man'
    ];

    await Promise.each(emails, async (email) => {
      await knex(table).where({ email }).update({
        type: 'service',
        multisession: 'yes',
        two_fa: 'off',
      });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
