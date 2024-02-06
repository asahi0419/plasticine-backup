import Promise from 'bluebird';
import { compact, keyBy, map } from 'lodash-es';

import { RecordNotValidError } from '../../error/index.js';
import presenceValidator from './validators/presence.js';
import uniqueValidator from './validators/unique.js';
import { validateLength, validateRTLSelectCount } from './validators/length.js';
import { validateFormat, validateDatetimeFormat } from './validators/format.js';
import inclusionValidator from './validators/inclusion.js';
import { validateNumericality, validateRanges } from './validators/numericality.js';
import permissionValidator from './validators/permission.js';
import { integrityOnDependenceValidator } from './validators/integrity.js';
import { validateRTLSyncTo, validateRTLSyncToConfig } from './validators/sync.js';

export default async function validate(changedAttributes, service, flags, withException) {
  const { sandbox, modelFields, model } = service;
  const fieldsMap = keyBy(modelFields, 'alias');
  const action = sandbox.vm.p.action;

  if (!sandbox.record) await sandbox.assignRecord(changedAttributes, model);
  const record = sandbox.record.attributes;
  const recordAttributes = map(modelFields, ({ alias }) => ({ value: record[alias], alias }));
  const results = [];

  // HACK: permission's validation (only changed attributes)
  await Promise.each(modelFields, async (field) => {
    const value = changedAttributes[field.alias];
    if (!value) return;

    const result = await permissionValidator(value, field, sandbox, flags);
    results.push(result);
  })

  // validate all record's attributes
  await Promise.each(recordAttributes, async ({ value, alias }) => {
    const field = fieldsMap[alias];
    if (!field) return;

    results.push(await presenceValidator(value, field, sandbox, flags));

    if (field.type === 'string' && value) {
      results.push(validateLength(value.toString(), field, sandbox));
      results.push(validateFormat(value.toString(), field, sandbox));
    }

    if (field.type === 'datetime' && value) {
      results.push(validateDatetimeFormat(value, field, sandbox));
    }

    if (['array_string', 'fa_icon'].includes(field.type) && value) {
      results.push(validateLength(value.toString(), field, sandbox));
      results.push(inclusionValidator(value, field, sandbox));
    }

    if (['integer', 'float'].includes(field.type)) {
      results.push(validateNumericality(value, field, sandbox));
      results.push(validateRanges(value, field, sandbox));
    }

    if (['reference', 'reference_to_list'].includes(field.type) && value) {
      const result = await integrityOnDependenceValidator(record, field, fieldsMap, sandbox);
      results.push(result);
    }

    if (field.type === 'reference_to_list') {
      if (value) {
        const result = validateRTLSelectCount(value, field, sandbox);
        results.push(result);
      }

      if (flags && !flags.skipRtlSyncToValidation) {
        const result = await validateRTLSyncTo(record, field, sandbox, flags, withException);
        results.push(result);
      }
    }

    if (field.index === 'unique' && value) {
      const result = await uniqueValidator(record, field, model, sandbox);
      results.push(result);
    }
  });

  // HACK: "rtl_sync_to" validation
  if (model.alias === 'field' && record.type === 'reference_to_list' && changedAttributes.options) {
    const result = await validateRTLSyncToConfig(record, sandbox);
    results.push(result);
  }

  const errors = compact(results);
  if (!errors.length) return true;
  if (!withException) return false;

  const ValidationError = new RecordNotValidError(errors.join('\n'));
  ValidationError.message = sandbox.translate('static.cannot_proceed_the_record_due_to_validation', { action, model: model.name });
  throw ValidationError;
}
