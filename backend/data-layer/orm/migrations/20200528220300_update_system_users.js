/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const adminAccount = await HELPERS.getRecord(knex, 'account', { email: process.env.APP_ADMIN_USER });
  if (adminAccount) await HELPERS.updateRecord(knex, 'account', adminAccount, { email: process.env.APP_ADMIN_USER });

  const guestAccount = await HELPERS.getRecord(knex, 'account', { email: 'guest@free.man' });
  if (guestAccount) await HELPERS.updateRecord(knex, 'account', guestAccount, { email: 'guest@free.man' });

  const tasksAccount = await HELPERS.getRecord(knex, 'account', { email: 'planned_tasks@free.man' });
  if (tasksAccount) {
    const tasksUser = await HELPERS.getRecord(knex, 'user', { account: tasksAccount.id });
    await HELPERS.updateRecord(knex, 'user', tasksUser, { account: null, surname: 'Planned tasks' });
    await HELPERS.deleteRecord(knex, 'account', tasksAccount);
  }
};

export const up = (knex) => {
  const models = ['model', 'user', 'account'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
