import { map, isEmpty, isUndefined, omit, pick } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import DbRulesPerformer, { ACTIONS_MAP } from '../../db_rule/index.js';
import PlannedPerformer from '../../background/planned/performers/types/base.js';
import AuditPerformer from '../../audit/index.js';
import prepareAttributes from './pre-processors/prepare-attributes.js';
import processComplexAttributes from './pre-processors/process-complex-attributes.js';
import syncVirtualAttributes from './post-processors/sync-virtual-attributes.js';
import syncStore from './post-processors/sync-store.js';
import validate from './validator.js';
import { buildRecord } from './build.js';
import checkPermissions from './helpers/permissions-checker.js';
import pickAttributes from './helpers/attributes-picker.js';
import extractChangedAttributes from './helpers/extract-changed-attributes.js';
import { checkCoreLock, processCoreLock } from './helpers/core-locker.js';
import { applyHeaderActionsList } from './helpers/apply-header-actions.js';
import updateTranslations from '../../i18n/updater.js';

export default async (service, record, attributes, flags) => {
  const action = record.__inserted ? 'update' : 'create';
  service.sandbox.addVariable('action', action);

  if (action === 'create') attributes = buildRecord(service, attributes);

  const changedAttributes = extractChangedAttributes(record, attributes, service.modelFields);
  const isEmptyAttributes = isEmpty(omit(changedAttributes, ['__extraAttributes', '__humanizedAttributes']));

  if (action === 'update' && isEmptyAttributes) return record;

  if (service.mode === 'secure') await checkCoreLock(service, record, action, changedAttributes);
  return updateFlow(service, record, changedAttributes, flags);
};

async function updateFlow(service, record, attributes, flags) {
  const { sandbox, model, modelFields, mode } = service;
  const action = record.__inserted ? 'update' : 'create';

  await sandbox.assignRecord({ __previousAttributes: record, ...record }, model);
  await checkPermissions(service, action, flags);

  const preparedAttributes = await prepareAttributes(service, attributes, flags);

  await sandbox.record.setFlags(flags);
  await sandbox.record.assignAttributes(preparedAttributes);

  const dbRulesPerformer = new DbRulesPerformer(model, sandbox, flags);
  await dbRulesPerformer.perform('before', ACTIONS_MAP[action]);

  if (mode === 'secure') await validate(preparedAttributes, service, flags, true);
  await dbRulesPerformer.perform('after', ACTIONS_MAP[action], 'validation');

  const updatedRecord = await updateRecord(service, action, flags);

  await new AuditPerformer(model, modelFields, sandbox).perform(action);
  await new PlannedPerformer(service.model, service.sandbox, flags).update({ __previousAttributes: record, ...sandbox.record.attributes });

  await dbRulesPerformer.perform('after', ACTIONS_MAP[action]);
  await processCoreLock(service, { ...updatedRecord, ...pick(preparedAttributes, ['__lock', '__lock_fields']) });
  await updateTranslations(sandbox.record.attributes, model, modelFields, sandbox);

  return pick(updatedRecord, [ ...map(modelFields, 'alias'), 'id', '__inserted', '__type' ]);
}

async function updateRecord(service, action, flags = {}) {
  const { sandbox, model, modelFields } = service;
  const { record } = sandbox;
  const sandboxUnProtectSystemFields = flags.flags?.ex_save?.protectSystemFields === false;
  const attributes = await processComplexAttributes(record.changedAttributes, modelFields, sandbox);

  const virtualAttributes = pickAttributes(attributes, modelFields, 'virtual');
  const crossAttributes = pickAttributes(attributes, modelFields, 'cross');
  const schemaAttributes = pickAttributes(attributes, modelFields, 'schema');

  const modelProxy = await applyHeaderActionsList(service);
  const unProtectSystemFieldsRequest = modelProxy.getOption('ex_save.protectSystemFields') === false;
  const updateDateTimeFields = modelProxy.getOption('ex_save.updateDateTimeFields');

  const unprotectSystemFields = sandboxUnProtectSystemFields || unProtectSystemFieldsRequest;

  if (unprotectSystemFields && (action === 'update')) {
    schemaAttributes['updated_at'] = isUndefined(schemaAttributes['updated_at']) ? new Date() : schemaAttributes['updated_at'];
    schemaAttributes['updated_by'] = isUndefined(schemaAttributes['updated_by']) ? sandbox.user.id : schemaAttributes['updated_by'];
  } else if ( action === 'update') {
    schemaAttributes['updated_at'] = new Date();
    schemaAttributes['updated_by'] = sandbox.user.id;
    const emptyFields = ['created_at', 'created_by'];
    emptyFields.forEach(field => delete schemaAttributes[field]);
  } else if((action === 'create' ) && !unprotectSystemFields) {
    schemaAttributes['created_at'] = new Date();
    schemaAttributes['created_by'] = sandbox.user.id;
    const emptyFields = ['updated_at', 'updated_by'];
    emptyFields.forEach(field => delete schemaAttributes[field]);
  }

  if (!updateDateTimeFields) delete schemaAttributes['updated_at'];
  if (!record.isPersisted()) schemaAttributes.__inserted = true;

  record.assignAttributes({
    ...record.attributes,
    ...schemaAttributes,
    ...virtualAttributes,
    ...crossAttributes,
  });

  if((action === 'update') && !unprotectSystemFields) {
    record.record['created_at'] = record.previousAttributes['created_at'];
    record.record['created_by'] = record.previousAttributes['created_by'];
  }

  await db.model(model).where({ id: record.id }).update({
    ...schemaAttributes,
  });

  await record.reloadHumanizedAttributes();
  await syncStore(service);
  await syncVirtualAttributes(service);

  return record.record;
}
