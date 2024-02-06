import { isObject } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import scheme from './scheme.js';
import ModelImporter from '../import/index.js';
import * as HELPERS from '../helpers/index.js';

export const createAuditModel = (model, sandbox) => {
  const options = HELPERS.parseOptions(model.options);

  if (['audit', 'worklog'].includes(model.type)) return;
  if (options.hasOwnProperty('audit') && !options.audit) return;

  new ModelImporter(sandbox, 'seeding').process({
    ...scheme,
    name: `Audit for model #${model.id}`,
    plural: `Audit for model #${model.id}`,
    alias: `audit_${model.id}`,
    master_model: model.id,
  });
};

export const getAuditModel = (model) => {
  return db.getModel(modelAlias(model));
};

export const tryGetAuditModel = (model) => {
  try {
    return getAuditModel(model);
  } catch (error) {
    return;
  }
};

function modelAlias(model) {
  const modelId = isObject(model) ? model.id : model;
  return `audit_${modelId}`;
}
