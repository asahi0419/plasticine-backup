/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [filterModel] = await knex(modelsTableName).where({ alias: 'filter' });
  if (!filterModel) return;

  const filtersTableName = getTableName({ id: filterModel.id, type: 'core' });
  const filters = await knex(filtersTableName);

  await Promise.each(filters, async ({ id, query }) => {
    if (!query) return;
    await knex(filtersTableName).where({ id }).update({ query: query.replace(/\\'/g, '"') });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
