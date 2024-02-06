/* eslint-disable */

import getTableName from './helpers/table-name.js';

const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_USER_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      'user_groups',
      'phones',
      'language',
      '__column__.1_2',
      'surname',
      'account',
      'home_page',
      'autologout',
      '__tab__.service',
      '__section__.3',
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
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

const CREATE_USER_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'email',
      'name',
      'user_groups',
      'phones',
      'language',
      '__column__.1_2',
      'password',
      'surname',
      'autologout',
      'home_page',
      '__tab__.service',
      '__section__.3',
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
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

export const up = async (knex) => {
  await knex(formTableName).where({ model: 3, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_USER_FORM) });
  await knex(formTableName).where({ model: 3, alias: 'create_user' }).update({ options: JSON.stringify(CREATE_USER_FORM) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
