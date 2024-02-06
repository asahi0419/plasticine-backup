/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const TYPE_OPTIONS_BY_MODEL = {
  view: {
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
  },
  layout: {
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
  },
  page: {
    values: {
      layout: 'Layout',
      system_sidebar: 'System sidebar',
    },
    default: 'layout',
  },
  dashboard: {
    values: {
      main: 'Main',
    },
    default: 'main',
  },
};

const TYPE_OPTIONS_DEFAULT = {
  values: {
    main: 'Main',
  },
  default: 'main',
};

const SCRIPT = `const TYPE_OPTIONS_BY_MODEL = ${JSON.stringify(TYPE_OPTIONS_BY_MODEL, null, 2)};
const TYPE_OPTIONS_DEFAULT = ${JSON.stringify(TYPE_OPTIONS_DEFAULT, null, 2)};

const modelField = p.record.getField('model');
const typeField = p.record.getField('type');

const setOptions = (modelId) => {
  const model = utils.getModel(modelId);
  const options = TYPE_OPTIONS_BY_MODEL[model.alias] || TYPE_OPTIONS_DEFAULT;

  typeField.setOptions(options);
}

setOptions(p.record.getValue('model'));
modelField.onChange((oldValue, newValue) => setOptions(newValue));`;

const migrate = (knex, usModel, usTable) => async (urModel, urTable) => {
  const clause = { model: usModel.id, name: 'Type: Initialize' };
  const attributes = { script: SCRIPT };

  return knex(urTable).where(clause).update(attributes);
}

const onModelExistenceUIRule = (knex) => async (model, table) => {
  return onModelExistence(knex, 'ui_rule', migrate(knex, model, table));
}

export const up = (knex) => {
  return onModelExistence(knex, 'user_setting', onModelExistenceUIRule(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
