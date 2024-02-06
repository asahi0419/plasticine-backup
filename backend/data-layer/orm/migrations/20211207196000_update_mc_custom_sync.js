import { onModelsExistence } from './helpers/index.js';

import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (models) => {
  if (await knex.schema.hasColumn(getTableName({ id: models.mc_custom_sync.id }), 'receiver')) {
    await knex.schema.table(getTableName({ id: models.mc_custom_sync.id }), table => {
      table.renameColumn('receiver', 'user');
    });

    await knex(getTableName({ id: models.field.id }))
      .update({ alias: 'user' })
      .where({
        model: models.mc_custom_sync.id,
        alias: 'receiver'
      });
  }
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'field', 'mc_custom_sync' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
