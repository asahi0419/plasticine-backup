/* eslint-disable */

import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import * as CONSTANTS from '../../../business/db_rule/core/field/constants.js';

const migrate = (knex) => async (models) => {
  const fields = await HELPERS.getRecords(knex, 'field', { __inserted: true });

  await HELPERS.deleteRecord(knex, 'permission', { type: 'field' });

  await Promise.each(fields, async (field) => {
    if (!field.type) return;

    await Promise.each(CONSTANTS.DEFAULT_FIELD_PERMISSIONS[field.type], async ({ action, script }) => {
      await HELPERS.createRecord(knex, 'permission', {
        created_by: 1,
        created_at: new Date(),
        model: field.model,
        type: 'field',
        action,
        field: field.id,
        script,
      });
    });
  });
};

export const up = (knex) => {
  const models = ['field', 'permission'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
