/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  const modelsTableName = getTableName({ id: 1, type: 'core' });
  const [ fieldModel ] = await knex(modelsTableName).where({ alias: 'field' });
  const [ pluginModel ] = await knex(modelsTableName).where({ alias: 'plugin' });

  if (!fieldModel) return;
  if (!pluginModel) return;

  const fieldTableName = getTableName({ id: fieldModel.id, type: 'core' });
  await knex(fieldTableName).where({ model: pluginModel.id, alias: 'alias' }).update({ readonly_when_script: 'p.record.isPersisted()' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
