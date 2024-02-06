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
          'filter_panel_enabled',
          'quick_search_enabled',
          'paginator_enabled',
          'sorting_enabled',
          'auto_refresh_enabled',
          'group_actions_enabled',
          'cell_edit_enabled',
          '__tab__.service',
          '__section__.4',
          'id',
          '__section__.5',
          '__column__.5_1',
          'created_at',
          'updated_at',
          '__column__.5_2',
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
