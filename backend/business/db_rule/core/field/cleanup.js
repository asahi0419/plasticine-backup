import { isUndefined, isBoolean, isString } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import IntegrityManager from '../../../integrity/index.js';
import { parseOptions } from '../../../helpers/index.js';
import { worklogIsExist, worklogDBModel } from '../../../worklog/model.js';

export const cleanupWorklog = (field) => {
  if (worklogIsExist(field.model)) {
    return worklogDBModel(field.model).where({ related_field: field.id }).delete();
  }
}

export const cleanupRTL = (field) => {
  if (field.type !== 'reference_to_list') return;
  return db.model('rtl').where({ source_field: field.id }).delete();
}

export const updateRecords = (field) => {
  const options = parseOptions(field.options);

  if (field.virtual) return;
  if (db.schema.VIRTUAL_FIELDS.includes(field.type)) return;
  if (isUndefined(options.default)) return;

  let defaultValue = options.default;
  if (!defaultValue && !isBoolean(defaultValue)) return;

  if (field.type === 'array_string') {
    if (options.multi_select && isString(defaultValue)) defaultValue = defaultValue.split(',').map(v => `'${v}'`).join(',');
  }

  return db.model(field.model).whereNull(field.alias).update({ [field.alias]: defaultValue });
}

export const processAliasAfterUpdate = (field, sandbox) => new IntegrityManager(field, sandbox).perform('update', { alias: field.alias });
