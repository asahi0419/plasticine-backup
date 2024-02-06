/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const usersTableName = getTableName({ id: 3, type: 'core' });

export const up = (knex) => {
  return knex.schema.createTable(usersTableName, (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('surname');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  }).then(() => knex(modelsTableName).insert({
      name: 'User',
      alias: 'user',
      type: 'core',
      template: 'base',
      created_at: new Date(),
      created_by: 1,
    })
  );
};

export const down = (knex) => knex.schema.dropTable(usersTableName);
