import { find } from 'lodash-es';

import SEED from '../seeds/pages/auth/login.js';
import * as HELPERS from './helpers/index.js';

const migrate = knex => async (models, tableName) => {
  const seed = find(SEED.actions, { alias: 'auth_user' });

  if (seed) return knex(tableName).update({ server_script: seed.server_script }).where({ alias: seed.alias });
};

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
