import Promise from 'bluebird';
import { compact, isArray } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import Selector from '../../../record/fetcher/selector.js';
import presenceValidator from './presence.js';
import { parseOptions } from '../../../helpers/index.js';

const IGNORED_MODELS = ['email', 'attachment'];

// applied only for reference and reference to list
export const integrityOnDependenceValidator = async (record, field, fieldsMap, sandbox) => {
  const value = record[field.alias];
  const options = parseOptions(field.options);
  const foreignModel = db.getModel(options.foreign_model);

  if (isArray(options.depends_on) && options.depends_on.length) {
    const referenceModelFields = db.getFields({ model: foreignModel.id, type: 'reference' });

    const filter = generateFilterFromDependsOn(options.depends_on, record, fieldsMap, referenceModelFields);
    if (!filter) return;

    const { scope } = await new Selector(foreignModel, sandbox).getScope(filter);

    const ids = compact((isArray(value) ? value : [value]).map((v) => parseInt(v, 10)));
    const filteredIds = await scope.whereIn('id', ids).pluck('id');

    if (ids.length === filteredIds.length) return;

    return sandbox.translate('static.field_contains_not_permitted_value_by_depends_on', { field: field.name });
  }
};

export const validateGlobalReferences = async (record, model, sandbox) => {
  const crossRecords = await db.model('global_references_cross').where({ target_model: model.id, target_record_id: record.id });
  let promise = Promise.resolve();

  crossRecords.forEach((record) => {
    promise = promise.then(() => checkGlobalCrossReference(record, sandbox));
  });

  try {
    await promise;
  } catch (error) {
    return [sandbox.translate('static.some_records_has_global_reference_to_this_record')];
  }
};

function generateFilterFromDependsOn(depends_on, record, fieldsMap, referenceModelFields) {
  const filterParts = [];

  depends_on.forEach((depensOnFieldAlias) => {
    const dependsOnField = fieldsMap[depensOnFieldAlias];
    const options = parseOptions(dependsOnField.options);

    const pattern = `"foreign_model":"${options.foreign_model}",?`;
    const targetField = referenceModelFields.find(rmf => new RegExp(pattern).test(rmf.options));
    const targetValue = record[dependsOnField.alias];

    if (targetField && targetValue) {
      if (dependsOnField.type === 'reference') {
        filterParts.push(`${targetField.alias} = ${targetValue}`);
      }

      if (dependsOnField.type === 'reference_to_list' && isArray(targetValue) && targetValue.length) {
        filterParts.push(`${targetField.alias} IN (${targetValue.join(',')})`);
      }
    }
  });

  return filterParts.length && filterParts.join(' AND ');
}

async function checkGlobalCrossReference({ id, source_field, source_record_id }, sandbox) {
  const model = db.getModel(field.model);
  const field = db.getField({ id: source_field });

  if (IGNORED_MODELS.includes(model.alias)) return;

  const fields = db.getFields({ model: model.id, type: 'global_reference' });
  const record = await db.model(model.alias).where({ id: source_record_id }).getOne();

  const newSandbox = await sandbox.cloneWithoutDynamicContext();
  await newSandbox.assignRecord(record, model);

  if (presenceValidator(null, field, newSandbox)) {
    throw new Error(`Record #${record.id} (${model.alias}) has a required global reference ('${field.name}')`);
  }
}
