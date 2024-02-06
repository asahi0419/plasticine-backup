/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex) => {
  return knex(modelsTableName).where({ alias: 'geo_metadata' }).limit(1)
    .then(([model]) => {
      if (model) return model;
      return knex(modelsTableName).insert({
        name: 'Geo metadata',
        plural: 'Geo metadata',
        alias: 'geo_metadata',
        type: 'core',
        template: 'base',
        created_at: new Date(),
        created_by: 1,
        versionable_attachments: false,
      }, 'id')
    .then(([id]) => {
      return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
        table.increments('id').primary();
        table.integer('model');
        table.string('name');
        table.string('label');
        table.string('type');
        table.integer('point_a');
        table.integer('point_a_ref');
        table.integer('point_b');
        table.integer('point_b_ref');
        table.integer('path');
        table.string('alias');
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
  return knex(modelsTableName).where({ alias: 'sandbox' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
