/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [tCrossModel] = await knex(modelsTableName).where({ alias: 't_cross' }).limit(1);
  if (tCrossModel) return;

  const [id] = await knex(modelsTableName).insert({
    name: 'TCross',
    alias: 't_cross',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id');

  return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.integer('dtf_field_id');
    table.integer('dtf_record_id');
    table.integer('data_model_id');
    table.integer('data_record_id');
    table.integer('dvf_field_id');
    table.integer('dvf_record_id');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
    table.index(['dtf_field_id', 'dtf_record_id']);
    table.index(['data_model_id', 'data_record_id']);
    table.index(['dvf_field_id', 'dvf_record_id']);
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 't_cross' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
