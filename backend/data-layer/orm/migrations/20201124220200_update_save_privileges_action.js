/* eslint-disable */

import { pick, find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/06-pages.js';

const migrate = (knex) => async (models) => {
  const page = find(SEED.records, { alias: 'privilege_manager' }) || {};
  const [ action ] = page.actions || [];

  const record = await HELPERS.getRecord(knex, 'action', { alias: 'privilege_manager' });
  if (!record) return

  await HELPERS.updateRecord(knex, 'action',
    { alias: action.alias },
    pick(action, ['model', 'condition_script', 'server_script'])
  );
};

export const up = (knex) => {
  const models = ['page', 'action'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
