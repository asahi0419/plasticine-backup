/* eslint-disable */

import Promise from 'bluebird';
import { pick, isObject, map } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrateForms = async (knex, models) => {
  const records = HELPERS.getRecords(knex, 'form');

  await Promise.each(records, async (record) => {
    const options = parseOptions(record.options);

    if (isObject(options.components)) {
      const { options: componentsOptions = {}, list = [] } = options.components;
      options.components.options = pick(componentsOptions, list);
    }
    if (isObject(options.related_components)) {
      const { options: componentsOptions = {}, list = [] } = options.related_components;
      options.related_components.options = pick(componentsOptions, map(list, 'id'));
    }

    await HELPERS.updateRecord(knex, 'form', { id: record.id }, { options: JSON.stringify(options) });
  });
};

const migrate = (knex) => async (models) => {
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'form'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
