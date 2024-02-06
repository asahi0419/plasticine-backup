/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [model] = await knex(modelsTableName).where({ alias: 'ui_rule' }).limit(1);

  if (model) return;

  const [id] = await knex(modelsTableName).insert({
    name: 'UI Rule',
    alias: 'ui_rule',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
    versionable_attachments: false,
  }, 'id');

  return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.integer('model');
    table.string('name');
    table.integer('order');
    table.boolean('active');
    table.string('type');
    table.text('script');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

export const down = async (knex) => {
  const [model] = await knex(modelsTableName).where({ alias: 'ui_rule' }).limit(1);

  if (!model) return;

  return knex.schema.dropTable(getTableName({ id: model.id, type: 'core' }));
};
