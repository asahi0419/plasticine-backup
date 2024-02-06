/* eslint-disable */

import getTableName from './helpers/table-name.js';
import {onModelExistence} from './helpers/index.js';

const layoutTableName = getTableName({ id: 9, type: 'core' });

const DEFAULT_LAYOUT_OPTIONS = {
  columns: ['id', 'name', 'alias', 'order', 'active', 'created_at', 'updated_at', 'model'],
  columns_options: {},
  sort_order: [
    { field: 'id', type: 'descending' },
    { field: 'name', type: 'none' },
    { field: 'alias', type: 'none' },
    { field: 'order', type: 'none' },
    { field: 'active', type: 'none' },
    { field: 'created_at', type: 'none' },
    { field: 'updated_at', type: 'none' },
    { field: 'model', type: 'none' },
  ],
  wrap_text: true,
  no_wrap_text_limit: 50
};

const updateLayout = async (knex, model, table) => {
  const clause = { model: model.id, name: 'Default' };
  const attributes = { options: JSON.stringify(DEFAULT_LAYOUT_OPTIONS) };

  await knex(layoutTableName).where(clause).update(attributes);
};

const migrate = (knex) => async (model, table) => {
  await updateLayout(knex, model, table);
}

export const up = (knex) => {
  return onModelExistence(knex, 'form', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
}
