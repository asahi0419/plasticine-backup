/* eslint-disable */

import Promise from 'bluebird';
import { map, filter } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (models) => {
  const modelsAll = await HELPERS.getRecords(knex, 'model');
  const modelIDs = map(filter(modelsAll, (m = {}) => (m.type === 'custom')), 'id');
  const fields = await HELPERS.getRecords(knex, 'field', { type: 'autonumber' });
  const fieldsToUpdate = filter(fields, (f) => modelIDs.includes(f.model));

  await Promise.each(fieldsToUpdate, async (f) => {
    try {
      const modelTableName = getTableName({ id: f.model, type: 'custom' });
      const newType = `varchar(255)`;
      await knex.raw(`ALTER TABLE "${modelTableName}" ALTER COLUMN "${f.alias}" TYPE ${newType}`);
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
