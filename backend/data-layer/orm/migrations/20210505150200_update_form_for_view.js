/* eslint-disable */

import getTableName from './helpers/table-name.js';

const formTableName = getTableName({ id: 11, type: 'core' });

export const up = (knex, Promise) => knex(formTableName)
  .where({ model: 8, alias: 'default' })
  .update({
    page: null,
    options: JSON.stringify({
      components: {
        list: [
          '__tab__.main',
          '__section__.1',
          '__column__.1_1',
          'name',
          'type',
          'order',
          'model',
          'chart',
          '__column__.1_2',
          'alias',
          'layout',
          'appearance',
          'filter',
          '__section__.2',
          'condition_script',
          'options',
          '__tab__.settings',
          '__section__.3',
          'predefined_filters',
          '__section__.4',
          '__column__.4_1',
          'filter_panel_enabled',
          'paginator_enabled',
          'group_actions_enabled',
          '__column__.4_2',
          'quick_search_enabled',
          'auto_refresh_enabled',
          'cell_edit_enabled',
          '__section__.5',
          'tutorial',
          '__tab__.service',
          '__section__.6',
          'id',
          '__section__.7',
          '__column__.7_1',
          'created_at',
          'updated_at',
          '__column__.7_2',
          'created_by',
          'updated_by',
        ],
        options: {
          '__tab__.main': { expanded: true, name: 'Main' },
          '__tab__.settings': { expanded: true, name: 'Settings' },
          '__tab__.service': { name: 'Service' },
        },
        label_position: 'left',
      },
      related_components: { list: [], show_as_tabs: true },
    }),
  });

export const down = (knex, Promise) => {
  return Promise.resolve();
};
