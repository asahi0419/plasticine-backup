/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex(modelsTableName).insert({
    name: 'Action',
    alias: 'action',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id')
  .then(([id]) => {
    return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
      table.increments('id').primary();
      table.integer('model');
      table.string('name');
      table.string('alias');
      table.string('type');
      table.integer('position');
      table.boolean('group').defaultTo(false);
      table.boolean('on_insert');
      table.boolean('on_update');
      table.boolean('active');
      table.text('client_script');
      table.text('response_script');
      table.text('server_script');
      table.text('condition_script');
      table.timestamp('created_at', true).nullable();
      table.timestamp('updated_at', true).nullable();
      table.integer('created_by');
      table.integer('updated_by');
      table.boolean('__inserted').defaultTo(true);
      table.unique(['alias', 'model']);
    });
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'action' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
