/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  const modelsTableName = getTableName({ id: 1, type: 'core' });
  const [ permissionModel ] = await knex(modelsTableName).where({ alias: 'permission' });
  const [ pluginModel ] = await knex(modelsTableName).where({ alias: 'plugin' });

  if (!permissionModel) return;
  if (!pluginModel) return;

  const permissionTableName = getTableName({ id: permissionModel.id, type: 'core' });
  await knex(permissionTableName).where({ model: pluginModel.id, type: 'model', action: 'update' }).update({ script: 'p.currentUser.isAdmin()' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
