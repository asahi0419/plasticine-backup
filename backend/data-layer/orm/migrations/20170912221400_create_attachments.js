/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [model] = await knex(modelsTableName).where({ alias: 'attachment' }).limit(1);
  if (model) return;

  const [id] = await knex(modelsTableName).insert({
    name: 'Attachment',
    plural: 'Attachments',
    alias: 'attachment',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
    versionable_attachments: false,
  }, 'id');

  return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.integer('field');
    table.string('file_content_type');
    table.string('file_name');
    table.float('file_size');
    table.boolean('last_version').defaultTo(true);
    table.integer('linked_from');
    table.float('p_lat');
    table.float('p_lon');
    table.integer('target_record');
    table.boolean('thumbnail').defaultTo(false);
    table.integer('version');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'attachment' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
