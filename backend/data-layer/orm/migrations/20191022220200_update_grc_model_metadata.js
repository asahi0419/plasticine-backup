/* eslint-disable */

import Promise from 'bluebird';
import { find, map } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/25-global_references_cross.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateFields = async (knex, models) => {
  await HELPERS.updateRecord(knex, 'field',
    { model: models.global_references_cross.id, alias: 'source_model' },
    { name: 'Source field', alias: `source_field`, options: JSON.stringify({ foreign_model: 'field', foreign_label: 'name', filter: "`type` = 'global_reference'" }) }
  );
  await HELPERS.updateRecord(knex, 'field',
    { model: models.global_references_cross.id, alias: 'source_record_id' },
    { name: `Source record ID`, options: JSON.stringify({ composite_index: ['source_field'] }) }
  );
  await HELPERS.updateRecord(knex, 'field',
    { model: models.global_references_cross.id, alias: 'target_record_id' },
    { name: `Target record ID` }
  );

  const tableName = await HELPERS.getModelTableName(knex, 'global_references_cross');
  const hasColumn = {
    source_model: await knex.schema.hasColumn(tableName, 'source_model'),
  };

  if (hasColumn.source_model) {
    await knex.schema.table(tableName, (table) => {
      table.dropIndex(['source_model', 'source_record_id']);
      table.dropColumn('source_model');
      table.integer('source_field');
      table.index(['source_field', 'source_record_id']);
    });
  }
};

const migrateLayouts = async (knex, models) => {
  const defaultLayout = find(SEED.layouts, { name: 'Default' });
  await HELPERS.updateRecord(knex, 'layout',
    { model: models.global_references_cross.id, name: 'Default' },
    { options: JSON.stringify(defaultLayout.options) });
};

const migrateForms = async (knex, models) => {
  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: models.global_references_cross.id, alias: 'default' });
  if (!defaultForm) return;

  const defaultFormOptions = parseOptions(defaultForm.options);
  const defaultSeedsForm = find(SEED.forms, { alias: 'default' });

  defaultFormOptions.components.list = defaultSeedsForm.options.components.list;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.global_references_cross.id, name: 'Default' },
    { options: JSON.stringify(defaultFormOptions) });
};

const migrateRecords = async (knex) => {
  const modelTableName = await HELPERS.getModelTableName(knex, 'model');
  const fieldTableName = await HELPERS.getModelTableName(knex, 'field');

  const fields = await knex(fieldTableName).where({ type: 'global_reference' });
  const models = await knex(modelTableName).whereIn('id', map(fields, 'model'));

  await Promise.each(fields, async (field) => {
    const model = find(models, { id: field.model });
    const tableName = await HELPERS.getModelTableName(knex, model.alias);
    const records = await knex(tableName).whereNotNull(field.alias);

    await Promise.each(records, async (record) => {
      await HELPERS.updateRecord(knex, 'global_references_cross',
        { id: record[field.alias] },
        { source_field: field.id }
      );
    });
  });
};

const migrate = (knex) => async (models) => {
  await migrateFields(knex, models);
  await migrateLayouts(knex, models);
  await migrateForms(knex, models);
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'field', 'view', 'form', 'global_references_cross'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
