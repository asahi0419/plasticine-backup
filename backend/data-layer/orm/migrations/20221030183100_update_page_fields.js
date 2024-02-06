import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'page', async (model, table) => {
    await HELPERS.deleteRecord(knex, 'field', { alias: 'iframe' })

    if (await knex.schema.hasColumn(table, 'iframe')) {
      await knex.schema.table(table, (t) => t.dropColumn('iframe'));
    }
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
