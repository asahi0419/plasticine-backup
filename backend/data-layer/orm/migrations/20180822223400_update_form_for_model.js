/* eslint-disable */

import getTableName from './helpers/table-name.js';

const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_MODEL_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      'plural',
      'order',
      '__column__.1_2',
      'alias',
      'type',
      '__section__.2',
      'access_script',
      '__tab__.service',
      '__section__.3',
      '__column__.3_1',
      'id',
      'created_at',
      'updated_at',
      'inherits_model',
      'versionable_attachments',
      '__column__.3_2',
      'template',
      'created_by',
      'updated_by',
      'master_model',
      'audit',
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
  await knex(formTableName).where({ model: 1, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_MODEL_FORM) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
