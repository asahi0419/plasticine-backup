import { find } from 'lodash-es';

import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import loginSeed from '../seeds/pages/auth/login.js';

const migrate = (knex) => async (models) => {
  await updateAuthAction(knex, models);
};

const updateAuthAction = async (knex, models) => {
  const actionModel = models.action;

  return knex(getTableName({ id: actionModel.id }))
    .where({ alias: 'auth_user' })
    .update({ server_script: find(loginSeed.actions, { alias: 'auth_user' }).server_script });
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'action' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
