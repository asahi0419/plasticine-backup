/* eslint-disable */

import getTableName from './helpers/table-name.js';

const actionsTableName = getTableName({ id: 5, type: 'core' });

export const up = async (knex) => {
  await knex(actionsTableName)
    .where({ alias: 'save' })
    .update({ client_script: 'p.record.submit()' });

  await knex(actionsTableName)
    .where({ alias: 'delete' })
    .update({ client_script: "confirm('Are you sure to delete current record?') && p.record.submit(false)" });

  await knex(actionsTableName)
    .where({ alias: 'list_delete' })
    .update({ client_script: "confirm('Are you sure to delete selected records?')" });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
