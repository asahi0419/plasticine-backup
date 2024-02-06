/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex, Promise) => {
  return knex(modelsTableName).where({ alias: 'action' }).limit(1)
    .then(([model]) => model && knex(getTableName({ id: model.id, type: 'core' }))
      .where({ alias: 'auth_user' }).update({
        server_script: `const request = p.getRequest();
const { email, password } = request;
const { createSession, sendResponse } = authHelpers;

try {
  const user = await p.authUser(email, password);

  if (user.getAccount().getValue('status') === 'waiting_confirmation') {
    p.actions.openPage('email_confirmation', { token: p.encryptor.encrypt(email), process: 'waiting_confirmation' });
  } else {
    const session = await createSession(request, user);
    sendResponse(session, user);
  }
} catch (error) {
  p.response.error(error);
}`
      }));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
