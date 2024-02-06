/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const field = await HELPERS.getRecord(knex, 'field', { alias: 'type', model: models.user_setting.id });
  if (!field) return;

  const options = JSON.stringify({ ...JSON.parse(field.options),
    values: {
      // view/layout
      main_view: 'Main',
      related_view: 'Related',
      embedded_view: 'Embedded',
      attachment_view: 'Attachment',
      reference_view: 'Reference',
      global_reference_view: 'Global reference',
      rtl: 'Reference to list',
      rtl_popup: 'Reference to list (popup)',
      // page
      layout: 'Layout',
      sidebar_container: 'Sidebar container',
      // dashboard
      main: 'Main',
    },
    default: 'main',
  });
  await HELPERS.updateRecord(knex, 'field', { id: field.id }, { options });
};

export const up = (knex) => {
  const models = ['field', 'user_setting'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
