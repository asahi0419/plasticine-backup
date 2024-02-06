/* eslint-disable */

import Promise from 'bluebird';
import { isString, filter } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

const migrate = (knex) => async (m) => {
  const fields = filter(await HELPERS.getRecords(knex, 'field', { type: 'reference' }), ({ options }) => parseOptions(options).default);

  await Promise.each(fields, async (field) => {
    const options = parseOptions(field.options);
    if (!isString(options.default)) return;
    delete options.default;

    await HELPERS.updateRecord(knex, 'field', { id: field.id }, { options: JSON.stringify(options) });
  });
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
