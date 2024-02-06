/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (model, table) => {
  const fieldsTableName = getTableName({ id: 2, type: 'core' });

  const clause = { alias: 'filter', model: model.id };
  const attributes = { readonly_when_script: "!p.record.getValue('data_source')" };

  await knex(fieldsTableName).where(clause).update(attributes);
}

export const up = (knex) => {
  return onModelExistence(knex, 'chart', migrate(knex));
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
