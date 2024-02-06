/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const models = await knex(modelTableName);

  await Promise.each(models, async (model) => {
    const tableName = getTableName({ id: model.id });

    if (await knex.schema.hasTable(tableName)) {
      const column = await knex.schema.hasColumn(tableName, '__hash');
      if (!column) await knex.schema.table(tableName, (t) => t.string('__hash', 32));
    };
  });
};

export const down = (knex) => {
  return Promise.resolve();
};
