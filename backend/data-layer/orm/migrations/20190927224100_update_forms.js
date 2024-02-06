/* eslint-disable */

import Promise from 'bluebird';

import * as LOCAL_HELPERS from './helpers/index.js';
import * as GLOBAL_HELPERS from '../../../business/helpers/index.js';

const migrate = (knex) => async (model, tableName) => {
  await Promise.each(await knex(tableName), (record) => {
    const options = GLOBAL_HELPERS.parseOptions(record.options);

    options.components = options.components || { list: [], options: {}, label_position: 'left' };
    options.components.list = options.components.list || [];
    options.components.options = options.components.options || {};
    options.components.label_position = options.components.label_position || 'left';

    options.related_components = options.related_components || { list: [], options: {}, show_as_tabs: true };
    options.related_components.list = options.related_components.list || [];
    options.related_components.options = options.related_components.options || {};
    options.related_components.show_as_tabs = options.related_components.show_as_tabs || true;

    return knex(tableName).where({ id: record.id }).update({ options: JSON.stringify(options) });
  });
};

export const up = async (knex) => {
  return LOCAL_HELPERS.onModelExistence(knex, 'form', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
