/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const actionsTableName = getTableName({ id: 5, type: 'core' });

export const up = async (knex) => {
  const actions = await knex(actionsTableName);

  await Promise.each(actions, ({ id, server_script }) =>
    server_script && knex(actionsTableName).where({ id }).update({
      server_script: server_script.replace(/params.getAttributesFromFilter()/g, 'await $&')
    })
  );
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
