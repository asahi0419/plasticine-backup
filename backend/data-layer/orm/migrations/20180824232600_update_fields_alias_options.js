/* eslint-disable */

import getTableName from './helpers/table-name.js';

const fieldTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  await knex(fieldTableName)
    .where({ model: 2, alias: 'alias' })
    .update({
      options: JSON.stringify({
        composite_index: ['model'],
        format: '^[a-z_][a-z0-9_]{2,}$', length: 60
      })
    });
};

export const down = async (knex) => {
  await knex(fieldTableName)
    .where({ model: 2, alias: 'alias' })
    .update({
      options: JSON.stringify({
        composite_index: ['model'],
        format: '^[a-zA-Z0-9_]+$', length: 52
      })
    });
};
