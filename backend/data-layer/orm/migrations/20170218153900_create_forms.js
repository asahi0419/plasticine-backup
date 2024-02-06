/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex(modelsTableName).insert({
    name: 'Form',
    alias: 'form',
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
      table.bigInteger('order');
      table.boolean('active');
      table.text('condition_script');
      table.integer('page');
      table.text('options');
      table.string('label_position');
      table.boolean('show_rel_lists_as_tabs');
      table.timestamp('created_at', true).nullable();
      table.timestamp('updated_at', true).nullable();
      table.integer('created_by');
      table.integer('updated_by');
      table.boolean('__inserted').defaultTo(true);
    });
  })
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'rtl' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
