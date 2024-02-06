import { isObject } from 'lodash-es';

import ModelImporter from '../import/index.js';
import db from '../../data-layer/orm/index.js';

export const createWorklogModel = (model, sandbox) => {
  const worklogModelAlias = modelAlias(model);
  if (db.isModelExists(worklogModelAlias)) return;

  return new ModelImporter(sandbox, 'seeding').process({
    name: `Worklog for model #${model.id}`,
    plural: `Worklog for model #${model.id}`,
    alias: worklogModelAlias,
    master_model: model.id,
    order: -100,
    type: 'worklog',
    access_script: 'p.currentUser.canAtLeastRead()',
    audit: 'none',
    template: 'base',
    fields: [
      {
        name: 'Related record',
        alias: 'related_record',
        type: 'reference',
        options: { foreign_model: model.alias, foreign_label: 'id' },
        required_when_script: 'true',
      },
      {
        name: 'Related field',
        alias: 'related_field',
        type: 'reference',
        options: { foreign_model: 'field', foreign_label: 'name' },
        required_when_script: 'true',
      },
      {
        name: 'Data',
        alias: 'data',
        type: 'string',
        options: { length: 10000 },
        required_when_script: 'true',
      },
    ],
    views: [
      {
        name: 'Default',
        alias: 'default',
        type: 'grid',
        condition_script: 'p.currentUser.isAdmin()',
        layout: 'Default',
        filter: 'Default',
      },
    ],
    layouts: [
      {
        name: 'Default',
        type: 'grid',
        options: {
          columns: ['id', 'related_record', 'related_field', 'created_by', 'created_at', 'updated_at', 'updated_by'],
          columns_options: {},
          sort_order: [
            { field: 'id', type: 'descending' },
            { field: 'related_record', type: 'none' },
            { field: 'related_field', type: 'none' },
            { field: 'created_by', type: 'none' },
            { field: 'created_at', type: 'none' },
            { field: 'updated_at', type: 'none' },
            { field: 'updated_by', type: 'none' },
          ],
          wrap_text: true,
          no_wrap_text_limit: 50,
        },
      },
    ],
    permissions: [
      { type: 'model', action: 'create', script: 'true' },
      { type: 'model', action: 'update', script: 'true' },
      { type: 'model', action: 'delete', script: 'true' },
    ],
  });
};

export const deleteWorklogModel = async (model, sandbox) => {
  const worklogModelAlias = modelAlias(model);
  if (!db.isModelExists(worklogModelAlias)) return;

  const journalFieldsCount = (db.getFields({ type: 'journal', model: model.id }) || []).length;
  if (journalFieldsCount > 0) return;

  const worklogsCount = await db.model(worklogModelAlias, sandbox).count('id');
  if (worklogsCount > 0) return;

  const worklogModel = db.getModel(worklogModelAlias);
  return db.model('model', sandbox).destroyRecord(worklogModel);
};

export const getWorklogModel = (model) => {
  return db.getModel(modelAlias(model));
};

export const tryGetWorklogModel = (model) => {
  try {
    return getWorklogModel(model);
  } catch (error) {
    return;
  }
};

export const worklogDBModel = (model, sandbox) => {
  return db.model(modelAlias(model), sandbox);
};

export const worklogIsExist = (model) => {
  return db.isModelExists(modelAlias(model));
};

function modelAlias(model) {
  const modelId = isObject(model) ? model.id : model;
  return `worklog_${modelId}`;
}
