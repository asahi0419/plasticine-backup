/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/22-logs.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateForms = async (knex, models) => {
  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: models.log.id, alias: 'default' });
  if (!defaultForm) return;

  const defaultFormOptions = parseOptions(defaultForm.options);
  const defaultSeedsForm = find(SEED.forms, { alias: 'default' });

  defaultFormOptions.components.list = defaultSeedsForm.options.components.list;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.log.id, name: 'Default' },
    { options: JSON.stringify(defaultFormOptions) });
};

const migrate = (knex) => async (models) => {
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'form', 'log'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
