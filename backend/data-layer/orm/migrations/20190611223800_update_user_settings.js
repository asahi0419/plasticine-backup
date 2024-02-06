/* eslint-disable */

import Promise from 'bluebird';
import { each, find, keys, set } from 'lodash-es';

import getTableName from './helpers/table-name.js';
import { onModelExistence } from './helpers/index.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const pageTableName = getTableName({ id: 6, type: 'core' });

const USER_SETTING_TYPES = {
  view: [
    'main_view',
    'related_view',
    'embedded_view',
    'attachment_view',
    'reference_view',
    'global_reference_view',
    'rtl',
    'rtl_popup',
  ],
  layout: ['main_view'],
  page: ['layout', 'system_sidebar'],
  dashboard: ['main'],
};

const migrate = (knex) => async (model, table) => {
  await addColumnType(knex, model, table);
  await processUserSettings(knex, model, table);
}

const addColumnType = async (knex, model, table) => {
  const column = await knex.schema.hasColumn(table, 'type');
  if (!column) await knex.schema.table(table, (t) => t.string('type'));
}

const processUserSettings = async (knex, model, table) => {
  const models = await knex(modelTableName).whereIn('alias', keys(USER_SETTING_TYPES));
  const pages = await knex(pageTableName).whereIn('alias', USER_SETTING_TYPES['page']);

  await Promise.each(models, async (model) => {
    const records = knex(table).where({ model: model.id });

    await Promise.each(records, async (record) => {
      const attributes = { options: record.options };

      if (model.alias === 'view') processView(model, record, attributes);
      if (model.alias === 'page') await processPage(model, record, attributes, knex, pages);
      if (model.alias === 'layout') processOther(model, record, attributes);
      if (model.alias === 'dashboard') processOther(model, record, attributes);

      await knex(table).where({ id: record.id }).update(attributes);
    });
  });
}

const processView = (model, record, attributes) => {
  const types = USER_SETTING_TYPES[model.alias];

  each(types, (type) => {
    const oldOptions = JSON.parse(record.options);
    const newOptions = {};

    const autorefreshKey = `${type}_autorefresh`;
    const pageSizeKey = `${type}_page_size`;

    if (oldOptions.hasOwnProperty(autorefreshKey)) {
      set(newOptions, 'autorefresh.rate', oldOptions[autorefreshKey]);
    }

    if (oldOptions.hasOwnProperty(pageSizeKey)) {
      set(newOptions, 'page.size', oldOptions[pageSizeKey]);
    }

    attributes.type = type;
    attributes.options = JSON.stringify(newOptions);
  });
}

const processPage = async (model, record, attributes, knex, pages) => {
  const page = find(pages, { id: record.record_id });
  await knex(pageTableName).where({ id: page.id }).update({ access_script: true });
  attributes.type = page.alias;
}

const processOther = (model, record, attributes) => {
  const [ type ] = USER_SETTING_TYPES[model.alias];
  attributes.type = type;
}

export const up = (knex) => {
  return onModelExistence(knex, 'user_setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
