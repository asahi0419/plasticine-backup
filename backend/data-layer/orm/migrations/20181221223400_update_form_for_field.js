/* eslint-disable */

import getTableName from './helpers/table-name.js';

const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_FIELD_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      'alias',
      '__column__.1_2',
      'type',
      'index',
      '__section__.2',
      'required_when_script',
      'readonly_when_script',
      'hidden_when_script',
      '__section__.3',
      'options',
      'extra_attributes',
      'model',
      '__tab__.service',
      '__section__.4',
      'id',
      '__section__.5',
      '__column__.5_1',
      'created_at',
      'updated_at',
      'hint',
      'virtual',
      '__column__.5_2',
      'created_by',
      'updated_by',
      'audit',
      'marked_as_deleted',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true }
};

export const up = async (knex) => {
  await knex(formTableName).where({ model: 2, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_FIELD_FORM) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
