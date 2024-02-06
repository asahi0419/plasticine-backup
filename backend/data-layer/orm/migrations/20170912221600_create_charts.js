/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex(modelsTableName).where({ alias: 'chart' }).limit(1)
    .then(([model]) => {
      if (model) return model;
      return knex(modelsTableName).insert({
        name: 'Chart',
        alias: 'chart',
        type: 'core',
        template: 'base',
        created_at: new Date(),
        created_by: 1,
        versionable_attachments: false,
      }, 'id');
    })
    .then(([id]) => {
      return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
        table.increments('id').primary();
        table.string('alias');
        table.string('name');
        table.integer('data_source');
        table.text('client_script');
        table.text('server_script');
        table.text('filter');
        table.timestamp('created_at', true).nullable();
        table.timestamp('updated_at', true).nullable();
        table.integer('created_by');
        table.integer('updated_by');
        table.boolean('__inserted').defaultTo(true);
      });
    });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'chart' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
