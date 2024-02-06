/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  const createTable = (id) => knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.string('group');
    table.string('name');
    table.string('alias');
    table.text('value');
    table.string('description');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });

  return knex(modelsTableName).where({ alias: 'setting' }).then(([model]) => {
    if (model) {
      return createTable(model.id);
    } else {
      return knex(modelsTableName).insert({
        name: 'Setting',
        alias: 'setting',
        type: 'core',
        template: 'base',
        created_at: new Date(),
        created_by: 1,
      }, 'id')
      .then(([id]) => createTable(id));
    }
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'setting' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
