/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const COLUMNS = [
  'filter_panel_enabled',
  'quick_search_enabled',
  'paginator_enabled',
  'sorting_enabled',
  'auto_refresh_enabled',
  'group_actions_enabled',
  'cell_edit_enabled',
];

const fieldTableName = getTableName({ id: 2, type: 'core' });
const viewTableName = getTableName({ id: 8, type: 'core' });

const createEnabledColumns = async (knex) => {
  const createColumns = COLUMNS.map(async (column) => {
    const hasColumn = await knex.schema.hasColumn(viewTableName, column);
    return !hasColumn && knex.schema.table(viewTableName, (table) => table.boolean(column));
  });

  await Promise.all(createColumns);
};

const transferOptions = async (knex) => {
  const views = await knex(viewTableName);

  const transferOptionsToColumns = views.map(async ({ id, options }) => {
    const parsedOptions = parseOptions(options);
    const attributesToUpdate = {};

    COLUMNS.forEach((column) => {
      attributesToUpdate[column] = parsedOptions[column];
      delete parsedOptions[column];
    });

    attributesToUpdate.options = JSON.stringify(parsedOptions);

    return await knex(viewTableName).where({ id }).update(attributesToUpdate);
  });

  await Promise.all(transferOptionsToColumns);
};

export const up = async (knex, Promise) => {
  await createEnabledColumns(knex);
  await transferOptions(knex);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
