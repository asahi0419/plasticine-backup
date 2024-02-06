/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const [formModel] = await knex(modelsTableName).where({alias: 'form'});
  if (!formModel) return;

  await knex(fieldsTableName)
    .where({model: formModel.id, alias: 'order'})
    .update({options : JSON.stringify({ default: 0})});

};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
