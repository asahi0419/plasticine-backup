import Promise from 'bluebird';
import {
  pick,
  omit,
  compact,
  uniq,
  isNull,
  isUndefined,
  isArray,
  map,
  keyBy,
  filter,
  orderBy,
  each
} from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import cache from '../../../../../shared/cache/index.js';
import Selector from '../../../../../../business/record/fetcher/selector.js';
import FilterService from '../../../../../../business/filter/index.js';
import getCollectionHumanizer from '../../../../../../business/record/fetcher/humanizer/types/index.js';
import * as SECURITY from '../../../../../../business/security/index.js';
import * as CONSTANTS from '../../../../../../business/constants/index.js';
import { loadRecord } from '../helpers.js';
import { tryGetAuditModel } from '../../../../../../business/audit/model.js';
import { tryGetWorklogModel } from '../../../../../../business/worklog/model.js';

export async function loadUsers(items, sandbox) {
  const ids = uniq(compact([
    ...map(items, 'created_by'),
    ...map(items, 'updated_by'),
  ]));
  const records = await db.model('user').whereIn('id', ids).select('id', 'name', 'surname');
  const recordsPermitted = await SECURITY.checkAccess('model', { alias: 'user' }, sandbox) ? await (await new Selector(db.getModel('user'), sandbox).getScope()).scope : [];
  const recordsPermittedById = keyBy(recordsPermitted, 'id');

  return map(records, (r) => (recordsPermittedById[r.id] ? { ...r, __access: true } : r));
}

export async function loadItems(req) {
  const { model, params, sandbox, query = {} } = req;

  const record = await loadRecord(model, params.id, sandbox);
  await sandbox.assignRecord(record, model);

  const modelA = tryGetAuditModel(model);
  const modelW = tryGetWorklogModel(model);

  const permissions = await loadPermissions(model);

  const fields = loadFields(model, query);
  const fieldsW = filter(fields, (f) => (f.id == query.field) || (f.type === 'journal'));
  const fieldsA = filter(fields, ({ audit }) => ['audit_and_worklog'].includes(audit));

  const itemsWF = await loadItemsByFieldsWorklog(modelW, record, sandbox, permissions, fieldsW);
  const itemsAF = await loadItemsByFieldsAudit(modelA, record, sandbox, permissions, fieldsA, query);
  const itemsAM = await loadItemsByModelAudit(modelA, record, sandbox);

  return orderBy([ ...itemsWF, ...itemsAF, ...itemsAM ], ['created_at'], ['desc']);
}

export async function loadPermissions(model) {
  const permissions = filter(cache.namespaces.core.get('permissions')[model.id], { type: 'field', action: 'query' });
  return keyBy(permissions, 'field');
}

export function loadFields(model, query = {}) {
  return query.field
    ? [ ...db.getFields({ id: +query.field }) ]
    : [ ...db.getFields({ model: model.id, type: 'journal' }),
        ...db.getFields({ model: model.id, audit: 'audit_and_worklog' }) ];
}

async function loadItemsByFieldsWorklog(model, record, sandbox, permissions, fields) {
  if (!model) return [];

  const modelAccess = await SECURITY.checkAccess('model', model, sandbox);
  const scope = await db.model(model.alias).where({ related_record: record.id, __inserted: true }).whereIn('related_field', map(fields, 'id')).select('id', 'related_field', 'data', 'created_at', 'created_by');

  return Promise.reduce(fields, async (result, field) => {
    const records = filter(scope, { related_field: field.id });
    const recordsPermitted = modelAccess ? await loadItemsPermitted(model, records, sandbox, permissions[field.id]) : [];
    const recordsPermittedById = keyBy(recordsPermitted, 'id');
    const recordsMapped = map(records, (r) => ({ ...(recordsPermittedById[r.id] ? r : omit(r, ['id'])), type: 'worklog' }));
    return [ ...result, ...recordsMapped ];
  }, []);
}

async function loadItemsByFieldsAudit(model, record, sandbox, permissions, fields, options) {
  if (!model) return [];

  const modelAccess = await SECURITY.checkAccess('model', model, sandbox);
  const scope = await db.model(model.alias).where({ related_record: record.id, action: 'updated', __inserted: true }).whereIn('related_field', map(fields, 'id'));

  return Promise.reduce(fields, async (result, field) => {
    const records = filter(scope, { related_field: field.id });
    await humanizeItemsByFieldsAudit(model, records, field, sandbox);
    convertItemsByFieldsAudit(records, options);

    const recordsPermitted = modelAccess ? await loadItemsPermitted(model, records, sandbox, permissions[field.id]) : [];
    const recordsPermittedById = keyBy(recordsPermitted, 'id');
    const recordsMapped = map(records, (r) => ({ ...(recordsPermittedById[r.id] ? r : omit(r, ['id'])), type: 'audit' }));
    return [ ...result, ...recordsMapped ];
  }, []);
}

async function loadItemsByModelAudit(model, record, sandbox) {
  if (!model) return [];

  const records = await db.model(model.alias).where({ related_record: record.id, __inserted: true }).whereIn('action', ['created', 'deleted'])
  convertItemsByModelAudit(records);

  const recordsPermitted = await SECURITY.checkAccess('model', model, sandbox) ? await (await new Selector(model, sandbox).getScope()).scope : [];
  const recordsPermittedById = keyBy(recordsPermitted, 'id');
  const recordsMapped = map(records, (r) => ({ ...(recordsPermittedById[r.id] ? r : omit(r, ['id'])), type: 'audit' }));

  return recordsMapped;
}

export async function loadItemsPermitted(model, records, sandbox, queryPermission = {}) {
  const { script: filter } = queryPermission;
  if (!filter) return records;

  const filterService = new FilterService(model, sandbox);
  const { scope: result } = await filterService.apply(filter, records);

  return result;
}

export async function humanizeItemsByFieldsAudit(model, records, field, sandbox) {
  const fields = filter(db.getFields({ model: model.id }), ({ alias }) => !['from', 'to'].includes(alias));

  const [from, to] = ['from', 'to'].map((alias) => ({ alias, ...pick(field, ['id', 'type', 'options']) }));
  await Promise.each([from, to, ...fields], (f) => getCollectionHumanizer(f, sandbox, {skipFieldPermission : true})(records));
}

export function convertItemsByFieldsAudit(records, options = {}) {
  each(records, (record, i) => {
    records[i] = pick(record, ['id', 'created_at', 'created_by']);
    records[i].data = patternAuditData(record, options);
  });
}

export function convertItemsByModelAudit(records) {
  each(records, (record, i) => {
    records[i] = pick(record, ['id', 'created_at', 'created_by']);
    if (record.action === 'created') records[i].data = 'Record created';
    if (record.action === 'deleted') records[i].data = 'Record deleted';
  });
}

export function patternAuditData(record = {}, options = {}) {
  let data = options.audit_text_pattern || CONSTANTS.DEFAULT_AUDIT_TEXT_PATTERN;

  each(record, (value, alias) => {
    if (alias.startsWith('__')) return;
    if (record.__humanAttributes && record.__humanAttributes[alias]) value = record.__humanAttributes[alias] || value;
    data = data.replace(new RegExp(`\\$\\{${alias}\\}`, 'g'), trimAuditData(value, options));
  });

  return data;
}

export function trimAuditData(data, options = {}) {
  if (isNull(data)) return 'Null';
  if (isUndefined(data)) return 'undefined';
  if (isArray(data)) data = data.join(', ');

  const limit = +options.audit_text_limit == 0 ? +options.audit_text_limit
    : options.audit_text_limit || CONSTANTS.DEFAULT_AUDIT_TEXT_LIMIT;
  if (!limit) return data;

  return data.length > limit ? `${data.substring(0, limit)} ..` : data;
}
