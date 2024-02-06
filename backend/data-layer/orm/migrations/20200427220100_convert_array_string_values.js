/* eslint-disable */

import Promise from 'bluebird';
import { filter } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrate = (knex) => async (m) => {
  const fields = filter(await HELPERS.getRecords(knex, 'field', { type: 'array_string' }), ({ options }) => parseOptions(options).multi_select);
  if (!fields.length) return;

  const models = await Promise.map(fields, (field) => HELPERS.getModel(knex, { id: field.model }));

  console.log('=============================================');
  console.log('\x1b[37m%s\x1b[0m', `Multiselect Array (string) values conversion`);
  console.log('\x1b[37m%s\x1b[0m', `Models: ${models.length}`);
  console.log('=============================================');

  await Promise.each(models, async (model) => {
    const modelFields = filter(fields, { model: model.id });
    const records = await HELPERS.getRecords(knex, model.alias);

    console.log('\x1b[37m%s\x1b[0m', `Model: ${model.name}`);
    console.log('\x1b[37m%s\x1b[0m', `Fields: ${modelFields.length}`);
    console.log('\x1b[37m%s\x1b[0m', `Records: ${records.length}`);
    console.log('---------------------------------------------');

    await Promise.each(modelFields, async (field) => {
      const hasColumn = await knex.schema.hasColumn(getTableName({ id: model.id }), field.alias);
      if (!hasColumn) return;

      await Promise.each(records, async (record) => {
        if (!record[field.alias] || record[field.alias].startsWith("'")) return;
        const value = record[field.alias].split(',').map(v => `'${v}'`).join(',');
        await HELPERS.updateRecord(knex, model.alias, { id: record.id }, { [field.alias]: value });
      })
    });
  });
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
