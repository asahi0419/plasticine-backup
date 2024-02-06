import Promise from 'bluebird';
import { isArray, isEmpty, isString, find, reduce } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { NoPermissionsError } from '../../../error/index.js';

export const processCoreLock = async ({ model, sandbox, mode }, record) => {
  if (!isEmpty(record.__lock)) {
    const lockAttributes = { update: false, delete: false };

    if (record.__lock === true) {
      lockAttributes.update = true;
      lockAttributes.delete = true;
    }

    if (isArray(record.__lock) && record.__lock.length) {
      record.__lock.forEach(lockMode => (lockAttributes[lockMode] = true));
    }

    const existedLock = await db.model('core_lock').where({
      model: model.id,
      record_id: record.id,
    }).getOne();

    if (existedLock) {
      await db.model('core_lock', sandbox).updateRecord(existedLock, {
        ...lockAttributes,
        updated_by: sandbox.user.id,
        updated_at: new Date()
      }, false);
    } else {
      await db.model('core_lock', sandbox).createRecord({
        ...lockAttributes,
        model: model.id,
        record_id: record.id,
        created_by: sandbox.user.id,
        created_at: new Date(),
      }, false);
    }
  }

  if (!isEmpty(record.__lock_fields)) {
    const lockAttributes = { update: false, delete: false };

    let clause;
    if (isString(record.__lock_fields)) clause = record.__lock_fields;
    if (isArray(record.__lock_fields)) clause = `alias IN (${record.__lock_fields})`;
    const fields = await db.model('field').whereRaw(`(model = ${model.id}) AND (${clause})`);

    await Promise.each(fields, async (field) => {
      await db.model('core_lock', sandbox).createRecord({
        ...lockAttributes,
        model: model.id,
        record_id: record.id,
        field_update: field.id,
        created_by: sandbox.user.id,
        created_at: new Date(),
      }, false);
    });
  }
};

export const checkCoreLock = async ({ model, modelFields }, record, mode, changedAttributes = {}) => {
  if (!mode) return;

  const locks = db.getCoreLocks({ model: model.id, record_id: record.id });

  const masterLock = find(locks, { [mode]: true });
  const fieldsLock = reduce(locks, (result, lock) => {
    const field = find(modelFields, { id: lock.field_update });
    if (field && changedAttributes[field.alias]) result.push(field.name);
    return result;
  }, []);

  if (!isEmpty(masterLock)) throw NoPermissionsError(`Core lock: ${model.name} #${record.id} (${mode})`);
  if (!isEmpty(fieldsLock)) throw NoPermissionsError(`Core lock: ${model.name} #${record.id} (${mode})\nLocked fields change: ${fieldsLock.join(', ')} `);
};
