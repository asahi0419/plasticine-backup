/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex.schema.createTable(modelsTableName, (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('plural');
    table.string('alias');
    table.string('type');
    table.string('template');
    table.string('data_template');
    table.integer('inherits_model');
    table.text('access_script');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.integer('order');
    table.boolean('versionable_attachments');
    table.text('options');
    table.boolean('__inserted').defaultTo(true);
    table.unique(['alias']);
  }).then(() => knex(modelsTableName).insert({
      name: 'Model',
      alias: 'model',
      type: 'core',
      template: 'base',
      created_at: new Date(),
      created_by: 1,
    })
  );
};

export const down = (knex) => knex.schema.dropTable(modelsTableName);
