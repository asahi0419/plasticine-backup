/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/40-scheduled-tasks.js';

const migrateActions = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'action',
    { model: models.scheduled_task.id, alias: 'run_now' },
    { server_script: find(SEED.actions, { alias: 'run_now' }).server_script }
  );
};

const migrate = (knex) => async (models) => {
  await migrateActions(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'action', 'scheduled_task'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
