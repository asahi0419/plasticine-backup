/* eslint-disable */

import getTableName from './helpers/table-name.js';

const DEFAULT_OPTIONS = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'name',
      '__column__.1_2',
      'alias',
      '__section__.2',
      '__column__.2_1',
      'options',
      'description',
      '__tab__.service',
      '__section__.3',
      'id',
      '__section__.4',
      '__column__.4_1',
      'created_at',
      'updated_at',
      'installed',
      '__column__.4_2',
      'created_by',
      'updated_by',
      'pending',
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
  const modelsTableName = getTableName({ id: 1, type: 'core' });
  const [ formModel ] = await knex(modelsTableName).where({ alias: 'form' });
  const [ pluginModel ] = await knex(modelsTableName).where({ alias: 'plugin' });

  if (!formModel) return;
  if (!pluginModel) return;

  const formTableName = getTableName({ id: formModel.id, type: 'core' });
  await knex(formTableName).where({ model: pluginModel.id, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_OPTIONS) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
