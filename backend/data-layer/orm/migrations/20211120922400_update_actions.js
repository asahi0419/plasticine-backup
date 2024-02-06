import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', async (model) => {
    await HELPERS.deleteRecord(knex, 'action', { alias: 'right_header_logout' });
    await HELPERS.updateRecord(knex, 'action', { alias: 'logout' }, {
      server_script: `const account = p.currentUser.getAccount();

try {
  await account.closeCurrentSession({ reason_to_close: 'manual' });
  await p.actions.logout({ redirect: await account.getLogoutCallbackUrl() });
} catch (error) {
  p.response.error(error);
}`
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
