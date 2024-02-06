/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const hasPlural = await knex.schema.hasColumn(modelTableName, 'plural');

  if (!hasPlural) await knex.schema.table(modelTableName, async (table) => table.string('plural'));

  const models = await knex(modelTableName).where({ type: 'core' });

  const promises = models.map(({ id, name }) => knex(modelTableName).where({ id }).update({ plural: `${name}s` }));

  return Promise.all(promises);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
