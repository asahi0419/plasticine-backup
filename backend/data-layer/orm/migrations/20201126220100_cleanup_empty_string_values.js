/* eslint-disable */

import Promise from 'bluebird';
import { find, isNull } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const TYPES_TO_MIGRATE = ['array_string', 'string', 'color', 'condition', 'fa_icon', 'file', 'filter'];

const processFieldTypeOptions = (knex) => async (type) => {
  const fields = await HELPERS.getRecords(knex, 'field', { type, virtual: false });
  const models = await Promise.map(fields, (field) => HELPERS.getModel(knex, { id: field.model }));

  console.log('=============================================');
  console.log('\x1b[37m%s\x1b[0m', `Field type '${type}': options cleanup`);
  console.log('\x1b[37m%s\x1b[0m', `Models: ${models.length}`);
  console.log('=============================================');

  await Promise.each(fields, async (field) => {
    const model = find(models, { id: field.model });
    if (!model) return;
    const tableName = getTableName({ id: model.id })

    const hasColumn = await knex.schema.hasColumn(tableName, field.alias);
    if (!hasColumn) return;

    const options = parseOptions(field.options);

    if (!Object.keys(options).includes('default') || (!isNull(options.default) && !options.default)) {
      console.log('\x1b[37m%s\x1b[0m', `Field type '${type}': ${field.name}`);
      options.default = null;
      await HELPERS.updateRecord(knex, 'field', { id: field.id }, { options: JSON.stringify(options) });
    }
  });
};

const processFieldTypeValues = (knex) => async (type) => {
  const fields = await HELPERS.getRecords(knex, 'field', { type, virtual: false });
  const models = await Promise.map(fields, (field) => HELPERS.getModel(knex, { id: field.model }));

  console.log('=============================================');
  console.log('\x1b[37m%s\x1b[0m', `Field type '${type}': values cleanup`);
  console.log('\x1b[37m%s\x1b[0m', `Models: ${models.length}`);
  console.log('=============================================');

  await Promise.each(fields, async (field) => {
    const options = parseOptions(field.options);
    if (options.subtype) return;

    const model = find(models, { id: field.model });
    if (!model) return;
    const tableName = getTableName({ id: model.id })

    const hasColumn = await knex.schema.hasColumn(tableName, field.alias);
    if (!hasColumn) return;

    const records = await HELPERS.getRecords(knex, model.alias, { [field.alias]: '' });
    if (!records.length) return;

    console.log('\x1b[37m%s\x1b[0m', `Model: ${model.name}`);
    console.log('\x1b[37m%s\x1b[0m', `Field: ${field.name}`);
    console.log('\x1b[37m%s\x1b[0m', `Records: ${records.length}`);
    console.log('---------------------------------------------');

    await Promise.each(records, async (record) => {
      await HELPERS.updateRecord(knex, model.alias, { id: record.id }, { [field.alias]: options.default || null });
    })
  });
};

const migrate = (knex) => async (m) => {
  const fields = await HELPERS.getRecords(knex, 'field', { model: m.model.id });
  if (!fields.length) return;

  await Promise.each(TYPES_TO_MIGRATE, processFieldTypeOptions(knex));
  await Promise.each(TYPES_TO_MIGRATE, processFieldTypeValues(knex));
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
