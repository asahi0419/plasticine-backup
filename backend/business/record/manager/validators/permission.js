import { isArray, map, difference, compact } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../record/fetcher/selector.js';
import { parseOptions, isPlainObject } from '../../../helpers/index.js';
import { createPermissionChecker } from '../../../security/permissions.js';

const VALIDATORS = {
  reference: referenceValidator,
  reference_to_list: referenceValidator,
  global_reference: globalReferenceValidator,
};

export default async (value, field, sandbox, flags) => {
  if (!['primary_key', 'journal'].includes(field.type)) {
    const model = db.getModel(field.model);
    const permissionChecker = createPermissionChecker(sandbox.user, sandbox);
    const permittedByFlags = flags && (!flags.checkPermission(sandbox.vm.p.action) || flags.flags.ignorePermissions);
    const permitted = permittedByFlags || await permissionChecker('field', 'update', model.id, field.id, sandbox.record.id);

    if (!permitted) {
      return sandbox.translate('static.no_permissions_to_action_on_the_field', { action: 'update', field: field.name });
    }
  }

  if (['reference', 'reference_to_list', 'global_reference'].includes(field.type)) {
    return VALIDATORS[field.type](value, field, sandbox, flags);
  }
};

async function referenceValidator(value, field, sandbox) {
  const options = parseOptions(field.options);
  const ids = compact((isArray(value) ? value : [value]).map((v) => parseInt(v, 10)));

  const foreignModel = db.getModel(options.foreign_model);
  const { scope } = await new Selector(foreignModel, sandbox).defaultScope();
  const records = await scope.whereIn('id', ids).select('id');

  const diff = difference(ids, map(records, 'id'));
  if (!diff.length) return;

  return sandbox.translate('static.field_contains_not_permitted_value', { field: field.name });
}

async function globalReferenceValidator(value, field, sandbox, flags) {
  if (isPlainObject(value) && value.id && value.__type) {
    const model = db.getModel(value.__type);

    const options = { includeNotInserted: true, ignorePermissions: (flags && flags.flags.ignorePermissions) };
    const { scope } = await new Selector(model, sandbox, options).defaultScope();
    const record = await scope.where({ id: value.id }).select('id').getOne();

    return !record && sandbox.translate('static.field_contains_not_permitted_value', { field: field.name });
  }
}
