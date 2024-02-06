/* eslint-disable */

import Promise from 'bluebird';
import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrate = (knex) => async (m) => {
  const fields = await HELPERS.getRecords(knex, 'field', { type: 'array_string' });
  const models = await Promise.map(fields, (field) => HELPERS.getModel(knex, { id: field.model }));

  await Promise.each(fields, async (field) => {
    const model = find(models, { id: field.model });
    if (!model) return;
    const tableName = getTableName({ id: model.id })

    const hasColumn = await knex.schema.hasColumn(tableName, field.alias);
    if (!hasColumn) return;

    const records = await HELPERS.getRecords(knex, model.alias, { [field.alias]: '' });
    const options = parseOptions(field.options);

    await Promise.each(records, async (record) => {
      await HELPERS.updateRecord(knex, model.alias, { id: record.id }, { [field.alias]: options.default || null });
    })
  });
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
