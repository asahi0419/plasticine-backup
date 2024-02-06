/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { onModelExistence } from './helpers/index.js';

const fieldTableName = getTableName({ id: 2, type: 'core' });

const TYPE_FIELD_OPTIONS = {
  values: {
    main_view: 'Main',
    related_view: 'Related',
    embedded_view: 'Embedded',
    attachment_view: 'Attachment',
    reference_view: 'Reference',
    global_reference_view: 'Global reference',
    rtl: 'Reference to list',
    rtl_popup: 'Reference to list (popup)',
  },
  default: 'main_view',
};

const migrate = (knex) => async (model, table) => {
  const clause = { model: model.id, alias: 'type' };
  const attributes = { options: JSON.stringify(TYPE_FIELD_OPTIONS) };

  return knex(fieldTableName).where(clause).update(attributes);
}

export const up = (knex) => {
  return onModelExistence(knex, 'user_setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
