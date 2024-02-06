/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/44-ip-bans.js';

const migrate = (knex) => async (models) => {
  const field = find(SEED.fields, { alias: 'type' });
  await HELPERS.updateRecord(knex, 'field',
    { model: models.ip_ban.id, alias: 'type' },
    { options: JSON.stringify(field.options) });
};

export const up = (knex) => {
  const models = ['model', 'field', 'ip_ban'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
