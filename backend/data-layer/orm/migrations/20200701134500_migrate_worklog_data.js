/* eslint-disable */
import Promise from 'bluebird';
import { groupBy, pick, keys } from 'lodash-es';

import getTableName from './helpers/table-name.js';
import * as HELPERS from './helpers/index.js';
import { createWorklogModel, getWorklogModel } from '../../../business/worklog/model.js';
import Sandbox from '../../../business/sandbox/index.js';

export const up = async (knex) => {
  await HELPERS.onModelsExistence(knex, ['field', 'account'], createWorklogModelsForJournals(knex));
  await HELPERS.onModelsExistence(knex, ['field', 'extra_fields_attribute', 'rtl', 'account'], createWorklogModelsForComments(knex));
  return HELPERS.onModelsExistence(knex, ['worklog', 'account'], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

const createWorklogModelsForJournals = (knex) => async (models) => {
  const sandbox = await getSandbox();
  const modelIds = await getModelsIdsWithJournalFields(knex, models.field);

  await Promise.each(modelIds || [], async (modelId) => {
    const model = await HELPERS.getRecord(knex, 'model', { id: modelId });
    await createWorklogModel(model, sandbox);
  });
};

const createWorklogModelsForComments = (knex) => async (models) => {
  const sandbox = await getSandbox();
  const modelIds = await getModelsIdsWithFieldsWithComments(knex, models);

  await Promise.each(modelIds || [], async (modelId) => {
    const model = await HELPERS.getRecord(knex, 'model', { id: modelId });
    await createWorklogModel(model, sandbox);
  });
};


const migrate = (knex) => async (models) => {
  const sandbox = await getSandbox();
  const groupedWorklogs = groupBy(await getWorklogRecords(knex, models.worklog), 'related_model');
  const modelIds = keys(groupedWorklogs);

  await Promise.each(modelIds || [], async (modelId) => {
    const worklogs = groupedWorklogs[modelId];
    const model = await HELPERS.getRecord(knex, 'model', { id: modelId });

    await createWorklogModel(model, sandbox);
    const worklogModel = getWorklogModel(model);
    const worklogTableName = getTableName({ id: worklogModel.id, type: 'worklog' });
    const newWorklogs = worklogs.map((worklog) => pick(worklog, ['related_record', 'related_field', 'data', 'created_at', 'created_by']) );

    await knex(worklogTableName).insert(newWorklogs);
  });

  await HELPERS.deleteRecord(knex, 'model', { alias: 'worklog' });
  await knex.schema.dropTable(getTableName({ id: models.worklog.id, type: 'core' }));
};


const getSandbox = (userEmail = process.env.APP_ADMIN_USER) => {
  const user = { id: 1, account: { email: userEmail }};
  return Sandbox.create({ user }, 'seeding');
};

const getModelsIdsWithJournalFields = (knex, model) => {
  const modelTableName = getTableName({ id: model.id, type: 'core' });
  return knex(modelTableName).pluck('model').where({ type: 'journal' }).groupBy('model');
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

const getWorklogRecords = (knex, model) => {
  const modelTableName = getTableName({ id: model.id, type: 'core' });
  return knex(modelTableName);
};
