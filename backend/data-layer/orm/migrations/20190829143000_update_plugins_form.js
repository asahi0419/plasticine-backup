/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const OPTIONS = {
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
      '__attachments__',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__tab__.service': { name: 'Service' },
      '__attachments__': { name: 'Attachments' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

const migrate = (knex) => async (models) => {
  const view = await HELPERS.getRecord(knex, 'view', { model: models.attachment.id, alias: 'last_versions' });
  if (!view) return;

  OPTIONS.components.options.__attachments__.last_versions_view = view.id;

  await HELPERS.updateRecord(knex, 'form',
    { model: models.plugin.id, alias: 'default' },
    { options: JSON.stringify(OPTIONS) });
};

export const up = (knex) => {
  const models = ['view', 'form', 'plugin', 'attachment'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};


export const down = (knex, Promise) => {
  return Promise.resolve();
};
