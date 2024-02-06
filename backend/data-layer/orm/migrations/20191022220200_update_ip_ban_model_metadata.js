/* eslint-disable */

import Promise from 'bluebird';
import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/44-ip-bans.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateFields = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'ip_ban');

  await HELPERS.updateRecord(knex, 'field', { model: models.ip_ban.id, alias: 'ip' }, { index: `none` });

  const hasColumn = {
    type: await knex.schema.hasColumn(tableName, 'type'),
  };

  !hasColumn.type && await knex.schema.table(tableName, (table) => table.text('type'));

};

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

const migrateRecords = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'ip_ban');
  const records = await knex(tableName);

  await Promise.each(records, async (record) => {
    if (record.reason) {
      const type = record.reason.includes('code') ? 'security_code' : 'authorization';
      await HELPERS.updateRecord(knex, 'ip_ban', { id: record.id }, { type });
    }
  });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateLayouts(knex, models);
  await migrateForms(knex, models);
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'view', 'form', 'ip_ban'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
