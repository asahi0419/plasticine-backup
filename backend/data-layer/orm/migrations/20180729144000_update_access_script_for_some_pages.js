/* eslint-disable */

import getTableName from './helpers/table-name.js';

const pagesTableName = getTableName({ id: 6, type: 'core' });

export const up = async (knex) => {
  await knex(pagesTableName).where({ alias: 'login' }).update({ access_script: 'p.currentUser.isGuest()' });
  await knex(pagesTableName).where({ alias: 'start' }).update({ access_script: '!p.currentUser.isGuest()' });
  await knex(pagesTableName).whereIn('alias', ['privilege_manager', 'filter_manager', 'chart_manager', 'form_manager', 'appearance_manager', 'permission_manager', 'layout_manager']).update({ access_script: '!!p.internalVariables.loadingPagesByApi' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
