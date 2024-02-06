/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/45-sandboxes.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'action',
    { alias: 'run', model: models.sandbox.id },
    { server_script: find(SEED.actions, { alias: 'run' }).server_script }
  );
};

export const up = (knex) => {
  const models = ['action', 'sandbox'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
