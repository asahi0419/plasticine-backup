import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const { id } = await HELPERS.getModel(knex, {alias: 'account'});

  const hasColumns = await knex.schema.hasColumn(`object_${id}`, 'two_fa')
    && await knex.schema.hasColumn(`object_${id}`, 'multisession')
    && await knex.schema.hasColumn(`object_${id}`, 'last_password_change');

  await knex.schema.table(`object_${id}`, table => {
    if (!hasColumns) {
      table.string('two_fa');
      table.string('multisession');
      table.timestamp('last_password_change', true).nullable();
    }

    table.string('type').defaultTo('user');
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
