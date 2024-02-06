/* eslint-disable */
import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';
import * as HELPERS from './helpers/index.js';
import { createWorklogModel } from '../../../business/worklog/model.js';
import Sandbox from '../../../business/sandbox/index.js';

export const up = async (knex) => {
  await HELPERS.onModelsExistence(knex, ['field', 'extra_fields_attribute', 'rtl'], createWorklogModelsForComments(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

const createWorklogModelsForComments = (knex) => async (models) => {
  const sandbox = await getSandbox();
  const modelIds = await getModelsIdsWithFieldsWithComments(knex, models);

  await Promise.each(modelIds || [], async (modelId) => {
    const model = await HELPERS.getRecord(knex, 'model', { id: modelId });
    await createWorklogModel(model, sandbox);
  });
};


const getSandbox = (userEmail = process.env.APP_ADMIN_USER) => {
  const user = { id: 1, account: { email: userEmail }};
  return Sandbox.create({ user }, 'seeding');
};

const getModelsIdsWithFieldsWithComments = async (knex, models) => {
  const efaTableName = getTableName({ id: models.extra_fields_attribute.id, type: 'core' });
  const efaCommentsIds = await knex(efaTableName).pluck('id').where({ type: 'comments' });

  const fieldsTableName = getTableName({ id: models.field.id, type: 'core' });
  const [ efaField ] = await knex(fieldsTableName).where({ model: models.field.id, alias: 'extra_attributes' }).limit(1);
  if (!efaField) return;

  const rtlTableName = getTableName({ id: models.rtl.id, type: 'core' });
  const fieldsIds = await knex(rtlTableName).pluck('source_record_id').where({ source_field: efaField.id }).whereIn('target_record_id', efaCommentsIds);

  return knex(fieldsTableName).pluck('model').whereIn('id', fieldsIds).groupBy('model');
}
