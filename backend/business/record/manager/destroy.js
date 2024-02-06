import db from '../../../data-layer/orm/index.js';
import DbRulesPerformer, { ACTIONS_MAP } from '../../db_rule/index.js';
import AuditPerformer from '../../audit/index.js';
import PlannedPerformer from '../../background/planned/performers/types/base.js';
import IntegrityManager from '../../integrity/index.js';
import cleanupVirtualAttributes from './post-processors/cleanup-virtual-attributes.js';
import cleanupCoreLocks from './post-processors/cleanup-core-locks.js';
import cleanupPlannedEscalations from './post-processors/cleanup-planned-escalations.js';
import cleanupGlobalReferences from './post-processors/cleanup-global-references.js';
import syncStore from './post-processors/sync-store.js';
import checkPermissions from './helpers/permissions-checker.js';
import { checkCoreLock } from './helpers/core-locker.js';

const ACTION = ACTIONS_MAP.destroy;

export default async (service, record, flags) => {
  const { sandbox, model, modelFields, mode } = service;
  if (mode === 'secure') await checkCoreLock(service, record, ACTION);

  await sandbox.addVariable('action', ACTION).assignRecord(record, model);
  await checkPermissions(service, 'destroy', flags);
  await validate(service);

  const { attributes, previousAttributes } = sandbox.record;
  const integrityRecord = { ...attributes, __previousAttributes: previousAttributes }

  const integrityManager = new IntegrityManager(integrityRecord, sandbox);
  const dbRulesPerformer = new DbRulesPerformer(model, sandbox, flags);

  await integrityManager.perform('validate');
  await dbRulesPerformer.perform('before', ACTION);

  new Promise(async (resolve) => {
    await destroyRecord(service);

    await new AuditPerformer(model, modelFields, sandbox).perform(ACTION);
    await new PlannedPerformer(model, sandbox, flags).delete(record);

    await integrityManager.perform('delete');
    await dbRulesPerformer.perform('after', ACTION);

    resolve();
  });


  return attributes;
};

async function destroyRecord(service) {
  const { model, sandbox } = service;
  const record = sandbox.record.attributes;

  await db.model(model).where({ id: record.id }).delete();
  await cleanupVirtualAttributes(service);
  await cleanupCoreLocks(model, [record.id]);
  await cleanupPlannedEscalations(model, [record.id]);
  await cleanupGlobalReferences(model, [record.id], sandbox);
  await syncStore(service);

  return record;
}

async function validate(service) {
  const { model, sandbox } = service;

  // temporary disabled. https://redmine.nasctech.com/issues/63921
  // const errors = await validateGlobalReferences(sandbox.record.attributes, model, sandbox);
  // if (errors) throw new IntegrityError(errors.join('\n'));
}
