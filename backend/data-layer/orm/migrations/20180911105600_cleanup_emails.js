/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex, Promise) => {
  const [emailModel] = await knex(modelsTableName).where({ alias: 'email' });

  return emailModel && knex(getTableName({ id: emailModel.id, type: 'core' })).whereNull('body').whereNull('subject').del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
