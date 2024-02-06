/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_DASHBOARD_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      'alias',
      'access_script',
      '__dashboard__',
      '__tab__.service',
      '__section__.3',
      '__column__.3_1',
      'id',
      '__section__.4',
      '__column__.4_1',
      'created_at',
      'updated_at',
      '__column__.4_2',
      'created_by',
      'updated_by',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__dashboard__': { name: 'Dashboard' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

export const up = async (knex) => {
  const [ dashboardModel ] = await knex(modelTableName).where({ alias: 'dashboard' }).limit(1);

  return dashboardModel
    ? knex(formTableName).where({ model: dashboardModel.id, alias: 'default' }).update({ page: null, options: JSON.stringify(DEFAULT_DASHBOARD_FORM) })
    : Promise.resolve();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
