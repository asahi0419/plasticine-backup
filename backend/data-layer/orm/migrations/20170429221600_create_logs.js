/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex(modelsTableName).where({ alias: 'log' }).limit(1)
    .then(([model]) => {
      if (model) return model;
      return knex(modelsTableName).insert({
        name: 'Log',
        plural: 'Logs',
        alias: 'log',
        type: 'core',
        template: 'base',
        created_at: new Date(),
        created_by: 1,
      }, 'id')
      .then(([id]) => {
        return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
          table.increments('id').primary();
          table.string('uuid', 20);
          table.string('domain');
          table.string('level');
          table.string('trigger_type');
          table.integer('trigger_id');
          table.integer('target_model');
          table.integer('target_record');
          table.text('message');
          table.text('meta');
          table.bigInteger('timestamp');
          table.string('tag');
          table.timestamp('created_at', true).nullable();
          table.timestamp('updated_at', true).nullable();
          table.integer('created_by');
          table.integer('updated_by');
          table.boolean('__inserted').defaultTo(true);
        });
      });
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'log' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
