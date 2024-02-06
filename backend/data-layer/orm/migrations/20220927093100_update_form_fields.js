import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'form', async (model, table) => {
    if (!(await knex.schema.hasColumn(table, 'label_position'))) {
      await knex.schema.table(table, t => t.string('label_position'));
    }
    if (!(await knex.schema.hasColumn(table, 'show_rel_lists_as_tabs'))) {
      await knex.schema.table(table, t => t.boolean('show_rel_lists_as_tabs'));
    }
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
