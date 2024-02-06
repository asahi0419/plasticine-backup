import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'associated_geo_object', async (model, table) => {
    await HELPERS.deleteRecord(knex, 'field', { model: model.id, alias: 'datasource_id' })
    if (!await knex.schema.hasColumn(table, 'datasource_id')) return;
    await knex.schema.table(table, t => t.dropColumn('datasource_id'));
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
