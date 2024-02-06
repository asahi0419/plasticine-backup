/* eslint-disable */

import Promise from 'bluebird';
import { isString, map, filter } from 'lodash-es';

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const modelsAll = await HELPERS.getRecords(knex, 'model');
  const modelIDs = map(filter(modelsAll, (m = {}) => (m.type !== 'custom')), 'id');
  const fields = await HELPERS.getRecords(knex, 'field', { type: 'string' });
  const fieldsToUpdate = filter(fields, (f) => modelIDs.includes(f.model)
                                               && isString(f.options)
                                                        && f.options.includes('rows":1')
                                                        && !f.options.includes('length":255'));

  await Promise.each(fieldsToUpdate, async (f) => {
    try {
      const options = JSON.stringify({ ...JSON.parse(f.options), rows: undefined });
      await HELPERS.updateRecord(knex, 'field', { id: f.id }, { options });
    } catch (error) {
      console.log(error);
    }
  })
};

export const up = (knex) => {
  const models = ['model', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
