/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/43-plugins.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateFields = async (knex, models) => {
  const tableName = await HELPERS.getModelTableName(knex, 'plugin');

  await HELPERS.updateRecord(knex, 'field', { model: models.plugin.id, alias: 'name'        }, { readonly_when_script: `true` });
  await HELPERS.updateRecord(knex, 'field', { model: models.plugin.id, alias: 'alias'       }, { readonly_when_script: `true` });
  await HELPERS.updateRecord(knex, 'field', { model: models.plugin.id, alias: 'description' }, { readonly_when_script: `true` });
  await HELPERS.updateRecord(knex, 'field', { model: models.plugin.id, alias: 'options'     }, { readonly_when_script: `p.record.getValue('status') === 'inactive'` });
  await HELPERS.updateRecord(knex, 'field', { model: models.plugin.id, alias: 'status'      }, { readonly_when_script: `true` });

  await HELPERS.deleteRecord(knex, 'field', { model: models.plugin.id, alias: 'installed' });
  await HELPERS.deleteRecord(knex, 'field', { model: models.plugin.id, alias: 'pending' });

  const hasColumn = {
    installed: await knex.schema.hasColumn(tableName, 'installed'),
    pending: await knex.schema.hasColumn(tableName, 'pending'),
    status: await knex.schema.hasColumn(tableName, 'status'),
  };

  hasColumn.installed && await knex.schema.table(tableName, (table) => table.dropColumn('installed'));
  hasColumn.pending && await knex.schema.table(tableName, (table) => table.dropColumn('pending'));
  !hasColumn.status && await knex.schema.table(tableName, (table) => table.text('status'));
};

const migrateLayouts = async (knex, models) => {
  const defaultLayout = find(SEED.layouts, { name: 'Default' });
  await HELPERS.updateRecord(knex, 'layout',
    { model: models.plugin.id, name: 'Default' },
    { options: JSON.stringify(defaultLayout.options) });
};

const migrateForms = async (knex, models) => {
  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: models.plugin.id, alias: 'default' });
  if (!defaultForm) return;

  const defaultFormOptions = parseOptions(defaultForm.options);
  const defaultSeedsForm = find(SEED.forms, { alias: 'default' });

  defaultFormOptions.components.list = defaultSeedsForm.options.components.list;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.plugin.id, name: 'Default' },
    { options: JSON.stringify(defaultFormOptions) });
};

const migrateActions = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'action', { model: models.plugin.id, alias: 'install'          });
  await HELPERS.deleteRecord(knex, 'action', { model: models.plugin.id, alias: 'cancel_install'   });
  await HELPERS.deleteRecord(knex, 'action', { model: models.plugin.id, alias: 'uninstall'        });
  await HELPERS.deleteRecord(knex, 'action', { model: models.plugin.id, alias: 'cancel_uninstall' });

  await HELPERS.updateRecord(knex, 'action', { model: models.plugin.id, alias: 'update' }, { condition_script: `p.currentUser.canUpdate() && (p.record.getValue('status') === 'active')` });
};

const migratePermissions = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'permission', { model: models.plugin.id, action: 'update' }, { script: `p.currentUser.canAtLeastWrite()` });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateLayouts(knex, models);
  await migrateForms(knex, models);
  await migrateActions(knex, models);
  await migratePermissions(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'view', 'form', 'permission', 'plugin'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
