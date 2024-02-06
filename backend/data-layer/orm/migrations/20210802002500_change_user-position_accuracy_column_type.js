import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (models) => {
  const fieldTable = getTableName({ id: models.field.id });
  const userPositionTable = getTableName({ id: models.user_position.id });

  if (await knex.schema.hasColumn(userPositionTable, 'accuracy')) {
    await knex.schema.alterTable(userPositionTable, table => {
      table.double('accuracy').alter();
    });

    await knex(fieldTable)
      .where({ model: models.user_position.id, alias: 'accuracy' })
      .update({ type: 'float' });
  }
};

export const up = (knex) => {
  const models = ['model', 'field', 'user_position'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function (knex, Promise) {
  Promise.resolve();
};
