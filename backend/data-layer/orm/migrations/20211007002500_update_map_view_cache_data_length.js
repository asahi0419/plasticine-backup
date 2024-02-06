import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (models) => {
  const tableName = getTableName({ id: models.map_view_cache.id });

  if (await knex.schema.hasColumn(tableName, 'data')) {
    await knex.schema.alterTable(tableName, (table) => {
      table.text('data').alter();
    });

    await knex(getTableName({ id: models.field.id }))
      .where({ model: models.map_view_cache.id, alias: 'data' })
      .update({ options: JSON.stringify({ length: 'unlimited', rows: 10, syntax_hl: 'json' }) });
  }
};

export const up = (knex) => {
  const models = ['model', 'field', 'map_view_cache'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function (knex, Promise) {
  Promise.resolve();
};
