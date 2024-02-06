/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { onModelExistence } from './helpers/index.js';

const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'user',
      '__column__.1_2',
      'record_id',
      '__section__.2',
      'options',
      'type',
      'model',
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

const migrate = (knex) => (model) => {
  const clause = { alias: 'default', model: model.id };
  const attributes = { options: JSON.stringify(DEFAULT_FORM) };

  return knex(formTableName).where(clause).update(attributes);
}

export const up = (knex) => {
  return onModelExistence(knex, 'user_setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
