/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = (knex) => {
  return knex.schema.createTable(fieldsTableName, (table) => {
    table.increments('id').primary();
    table.integer('model');
    table.string('name');
    table.string('alias');
    table.string('type');
    table.string('audit');
    table.string('index');
    table.text('options');
    table.text('required_when_script');
    table.text('hidden_when_script');
    table.text('readonly_when_script');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('virtual');
    table.boolean('__inserted').defaultTo(true);
    table.boolean('__translated').defaultTo(false);
    table.unique(['alias', 'model']);
  }).then(() => knex(modelsTableName).insert({
      name: 'Field',
      alias: 'field',
      type: 'core',
      template: 'base',
      created_at: new Date(),
      created_by: 1,
    })
  );
};

export const down = (knex) => knex.schema.dropTable(fieldsTableName);
