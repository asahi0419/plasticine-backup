import { pick, isUndefined } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import DbRulesPerformer, { ACTIONS_MAP } from '../../db_rule/index.js';
import AuditPerformer from '../../audit/index.js';
import PlannedPerformer from '../../background/planned/performers/types/base.js';
import prepareAttributes from './pre-processors/prepare-attributes.js';
import processComplexAttributes from './pre-processors/process-complex-attributes.js';
import syncVirtualAttributes from './post-processors/sync-virtual-attributes.js';
import syncStore from './post-processors/sync-store.js';
import validate from './validator.js';
import pickAttributes from './helpers/attributes-picker.js';
import checkPermissions from './helpers/permissions-checker.js';
import extractChangedAttributes from './helpers/extract-changed-attributes.js';
import { buildRecord } from './build.js';
import { processCoreLock } from './helpers/core-locker.js';
import { applyHeaderActionsList } from './helpers/apply-header-actions.js';

export default async (service, attributes = {}, flags) => {
  const { sandbox, model, modelFields, mode } = service;

  const action = 'create';
  sandbox.addVariable('action', action);

  const builtRecord = buildRecord(service, {});
  const preparedBuiltAttributes = await prepareAttributes(service, builtRecord, flags);

  await sandbox.assignRecord({ __previousAttributes: preparedBuiltAttributes, ...preparedBuiltAttributes }, model);
  await checkPermissions(service, action, flags);

  const preparedAttributes = { ... await prepareAttributes(service, attributes), __inserted:false};

  await sandbox.record.setFlags(flags);
  await sandbox.record.assignAttributes(preparedAttributes);

  await addRecordId(service);

  const dbRulesPerformer = new DbRulesPerformer(model, sandbox, flags, mode);
  await dbRulesPerformer.perform('before', ACTIONS_MAP[action]);

  if (mode === 'secure') {
    const prevAttributes = sandbox.record.previousAttributes;
    const nextAttributes = sandbox.record.attributes;
    const changedAttributes = extractChangedAttributes(prevAttributes, nextAttributes, modelFields);
    await validate(changedAttributes, service, flags, true);
  }

  const record = await createRecord(service, flags);

  await new AuditPerformer(model, modelFields, sandbox).perform(action);
  await new PlannedPerformer(model, sandbox, flags, mode).create(record);

  await dbRulesPerformer.perform('after', ACTIONS_MAP[action]);
  await processCoreLock(service, { ...record, ...pick(preparedAttributes, ['__lock', '__lock_fields']) });

  return record;
};

async function createRecord(service, flags = {}) {
  const { sandbox, model, modelFields } = service;
  const sandboxUnProtectSystemFields = flags.flags?.ex_save?.protectSystemFields === false;

  const { record } = sandbox;

  const attributes = await processComplexAttributes(record.attributes, modelFields, sandbox);

  const schemaAttributes = pickAttributes(attributes, modelFields, 'schema');
  const virtualAttributes = pickAttributes(attributes, modelFields, 'virtual');
  const crossAttributes = pickAttributes(attributes, modelFields, 'cross');
  const primaryAttributes = { __inserted: true };

  const modelProxy = await applyHeaderActionsList(service);
  const unProtectSystemFields = modelProxy.getOption('ex_save.protectSystemFields') === false;


  if (sandboxUnProtectSystemFields || unProtectSystemFields) {
    schemaAttributes.created_at = isUndefined(schemaAttributes.created_at) ? new Date() : schemaAttributes.created_at
    schemaAttributes.created_by = isUndefined(schemaAttributes.created_by) ? sandbox.user.id : schemaAttributes.created_by
  } else {
    schemaAttributes.created_at = new Date();
    schemaAttributes.created_by = sandbox.user.id;
    schemaAttributes.updated_at=null;
    schemaAttributes.updated_by=null;
  }

  record.assignAttributes({
    ...schemaAttributes,
    ...virtualAttributes,
    ...crossAttributes,
    ...primaryAttributes,
  });

  await db.model(model).where({ id: record.id }).update({
    ...schemaAttributes,
    ...primaryAttributes,
  });

  await syncStore(service);
  await syncVirtualAttributes(service);

  return record.record;
}

async function addRecordId(service) {
  const { sandbox, model } = service;
  const [ id ] = await db.model(model).insert({ __inserted: false }, ['id']);

  sandbox.record.assignAttributes({ id });
}
