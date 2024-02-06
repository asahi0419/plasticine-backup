import Promise from 'bluebird';
import { union, includes, find, isEqual } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import cache from '../../../../presentation/shared/cache/index.js';
import { processOptions } from './process.js';
import { validateAlias, validateType, validateVirtual, validateDuplicate, validateOptions } from './validate.js';
import { cleanupWorklog, cleanupRTL, updateRecords, processAliasAfterUpdate } from './cleanup.js';
import { createWorklogModel, deleteWorklogModel } from '../../../worklog/model.js';

import * as CONSTANTS from './constants.js';

export const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'fields',
    params: { action, payload },
  });
}

export const createPermissions = (field, sandbox, mode) => {
  if (mode !== 'secure') return; // do not execute while seeding

  const permissions = CONSTANTS.DEFAULT_FIELD_PERMISSIONS[field.type] || []
  return Promise.map(permissions, ({ action, script }) => {
    return db.model('permission', sandbox).createRecord({
      model: field.model,
      type: 'field',
      field: field.id,
      action: action,
      script: script,
    }, false);
  });
}

export const deletePermissions = (field) => {
  if (field.type !== 'journal') return;
  return db.model('permission').where({ field: field.id }).delete();
}

function tryCreateWorklogModelForJournal(field, sandbox) {
  if (field.type !== 'journal') return;
  return createWorklogModel(db.getModel(field.model), sandbox);
}

function tryDeleteWorklogModel(field, sandbox) {
  return deleteWorklogModel(db.getModel(field.model), sandbox);
}

async function processEfaWorklogs(field, sandbox) {
  if (isEqual(field.__previousAttributes.extra_attributes, field.extra_attributes)) return;

  const allEfeIds = union(field.extra_attributes, field.__previousAttributes.extra_attributes);
  const efaRecords = await db.model('extra_fields_attribute').where({ type: 'comments' }).whereIn('id', allEfeIds);
  const efaCommentsPresent = !!find(efaRecords, (r) => includes(field.extra_attributes, r.id));
  const previousEfaCommentsPresent = !!find(efaRecords, (r) => includes(field.__previousAttributes.extra_attributes, r.id));

  if (efaCommentsPresent === previousEfaCommentsPresent) return;
  if (efaCommentsPresent) {
    return createWorklogModel(db.getModel(field.model), sandbox);
  } else {
    await cleanupWorklog(field);
    return tryDeleteWorklogModel(field, sandbox);
  }
}

const createColumn = field => db.schema.column.create(field);
const updateColumn = field => !db.schema.VIRTUAL_FIELDS.includes(field.type) && db.schema.column.update(field.__previousAttributes || {}, field);
const deleteColumn = field => !db.schema.VIRTUAL_FIELDS.includes(field.type) && db.schema.column.delete(field);

export default {
  before_insert: [validateAlias, validateDuplicate, validateOptions, processOptions],
  before_update: [validateAlias, validateType, validateVirtual, validateOptions, processOptions],
  before_delete: [processOptions],
  after_insert: [reloadCache('insert'), createColumn, createPermissions, updateRecords, tryCreateWorklogModelForJournal, processEfaWorklogs],
  after_update: [reloadCache('update'), updateColumn, processAliasAfterUpdate, processEfaWorklogs],
  after_delete: [reloadCache('delete'), deleteColumn, deletePermissions, cleanupWorklog, tryDeleteWorklogModel, cleanupRTL],
};
