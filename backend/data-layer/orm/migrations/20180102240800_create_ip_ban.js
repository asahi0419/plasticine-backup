/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [efaModel] = await knex(modelsTableName).where({ alias: 'ip_ban' }).limit(1);
  if (efaModel) return;

  const [id] = await knex(modelsTableName).insert({
    name: 'IP Ban',
    plural: 'IP Bans',
    alias: 'ip_ban',
    access_script: 'p.currentUser.canAtLeastRead()',
    type: 'core',
    template: 'base',
    created_at: new Date(),
    created_by: 1,
  }, 'id');

  return knex.schema.createTable(getTableName({ id, type: 'core' }), (table) => {
    table.increments('id').primary();
    table.integer('account');
    table.string('ip');
    table.string('ban_type');
    table.integer('attempts');
    table.timestamp('ban_till', true).nullable();
    table.string('ban_level');
    table.text('reason');
    table.string('type');
    table.timestamp('created_at', true).nullable();
    table.timestamp('updated_at', true).nullable();
    table.integer('created_by');
    table.integer('updated_by');
    table.boolean('__inserted').defaultTo(true);
  });
};

export const down = (knex) => {
  return knex(modelsTableName).where({ alias: 'ip_ban' }).then((result) => {
    if (result.length) {
      return knex.schema.dropTable(getTableName({ id: result[0].id, type: 'core' }));
    }
  });
};
