/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const fieldTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const regexpClause = process.env.DB_TYPE === 'postgres' ? '~' : 'REGEXP';
  const fields = await knex(fieldTableName).where({ type: 'array_string' })
    .andWhere('options', regexpClause, 'multi_select":true');

  await Promise.each(fields, async (field) => {
    const tableName = getTableName({ id: field.model });
    const records = await knex(tableName).where(field.alias, regexpClause, '{"');

    await Promise.each(records, async (record) => {
      const oldValue = record[field.alias];
      const newValue = oldValue.replace('{', '[').replace('}', ']').split(',').join();

      await knex(tableName).where({ id: record.id }).update({ [field.alias]: newValue });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
