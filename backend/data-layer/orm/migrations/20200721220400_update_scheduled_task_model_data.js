/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/40-scheduled-tasks.js';

const migrateRecords = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'scheduled_task',
    { name: 'Session cleaner (Core)' },
    { script: find(SEED.records, { name: 'Session cleaner (Core)' }).script }
  );
};

const migrate = (knex) => async (models) => {
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'scheduled_task'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
