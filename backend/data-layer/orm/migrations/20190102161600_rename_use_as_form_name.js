/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const [ model ] = await knex(modelsTableName).where({ alias: 'form' }).limit(1);
  if (!model) return;

  return knex(fieldsTableName).where({ model: model.id, alias: 'use_form_name' }).update({ name: 'Show `name` as form header' });
};

export const down = async (knex, Promise) => {
  const [ model ] = await knex(modelsTableName).where({ alias: 'form' }).limit(1);
  if (!model) return;

  return knex(fieldsTableName).where({ model: model.id, alias: 'use_form_name' }).update({ name: 'Use as a form name' });
};
