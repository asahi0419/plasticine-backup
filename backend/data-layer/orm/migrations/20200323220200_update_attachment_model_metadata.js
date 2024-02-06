/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/27-attachments.js';

const migrateActions = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'action',
    { model: models.attachment.id, alias: 'attach_files' },
    { condition_script: find(SEED.actions, { alias: 'attach_files' }).condition_script }
  );
  await HELPERS.updateRecord(knex, 'action',
    { model: models.attachment.id, alias: 'set_thumbnail' },
    { condition_script: find(SEED.actions, { alias: 'set_thumbnail' }).condition_script }
  );
};

const migrate = (knex) => async (models) => {
  await migrateActions(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'action', 'attachment'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
