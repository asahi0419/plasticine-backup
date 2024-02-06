/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  await knex(getTableName({ id: 2, type: 'core' })).where({ model: 2 })
                            .whereIn('alias', ['alias', 'options', 'required_when_script', 'hidden_when_script', 'readonly_when_script'])
                            .update({ readonly_when_script: null });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
