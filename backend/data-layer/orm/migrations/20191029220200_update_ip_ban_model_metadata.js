/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/44-ip-bans.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateLayouts = async (knex, models) => {
  const defaultLayout = find(SEED.layouts, { name: 'Default' });
  await HELPERS.updateRecord(knex, 'layout',
    { model: models.ip_ban.id, name: 'Default' },
    { options: JSON.stringify(defaultLayout.options) });
};

const migrateForms = async (knex, models) => {
  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: models.ip_ban.id, alias: 'default' });
  if (!defaultForm) return;

  const defaultFormOptions = parseOptions(defaultForm.options);
  const defaultSeedsForm = find(SEED.forms, { alias: 'default' });

  defaultFormOptions.components.list = defaultSeedsForm.options.components.list;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.ip_ban.id, name: 'Default' },
    { options: JSON.stringify(defaultFormOptions) });
};

const migrate = (knex) => async (models) => {
  await migrateLayouts(knex, models);
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'layout', 'form', 'ip_ban'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
