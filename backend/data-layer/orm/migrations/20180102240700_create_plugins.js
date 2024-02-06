/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [model] = await knex(modelsTableName).where({ alias: 'plugin' }).limit(1);
  if (model) return;

  const [id] = await knex(modelsTableName).insert({
    name: 'Plugin',
    plural: 'Plugins',
    alias: 'plugin',
    access_script: 'p.currentUser.canAtLeastRead()',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id');

  return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.string('name');
    table.string('alias');
    table.text('options');
    table.text('description');
    table.text('status');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'plugin' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
