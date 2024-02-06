/* eslint-disable */

import { pick } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/pages/appearance-manager.js';

const migrate = (knex) => async (models) => {
  await HELPERS.updateRecord(knex, 'page',
    { alias: 'appearance_manager' },
    pick(SEED, ['server_script', 'template'])
  );
};

export const up = (knex) => {
  const models = ['page'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
