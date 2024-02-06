import moment from 'moment';
import { every, isString, isObject, isEmpty, isArray } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';
import { RecordNotValidError, IntegrityError } from '../../../error/index.js';
import { GLOBAL_DATE_FORMAT } from '../../../constants/index.js';

export const validateAlias = (field, sandbox) => {
  if (field.alias && field.alias.startsWith('__')) {
    const message = sandbox.translate('static.alias_cannot_start_with_double_underscore');
    throw new RecordNotValidError(message);
  }
};

export const validateType = (field, sandbox) => {
  if (field.type !== field.__previousAttributes.type) {
    const message = sandbox.translate('static.field_type_cannot_be_changed');
    throw new IntegrityError(message);
  }
};

export const validateVirtual = (field, sandbox) => {
  if (field.virtual !== field.__previousAttributes.virtual) {
    const message = sandbox.translate('static.field_virtual_cannot_be_changed');
    throw new IntegrityError(message);
  }
};

export const validateDuplicate = async (field, sandbox) => {
  if (field.type !== 'primary_key') return;

  const existedPrimaryKey = db.getField({ model: field.model, type: 'primary_key' });

  if (existedPrimaryKey) {
    throw new RecordNotValidError(sandbox.translate('static.impossible_create_secondary_primary_key'));
  }
};

export const validateOptions = async (field, sandbox, mode) => {
  if (['reference', 'reference_to_list'].includes(field.type)) {
    await validateReferenceOptions(field, sandbox, mode);
  }

  if (field.type === 'global_reference') {
    await validateGlobalReferenceOptions(field, sandbox, mode);
  }

  if (field.type === 'datetime') {
    validateDatetimeOptions(field, sandbox);
  }

  if (field.type === 'array_string') {
    validateArrayStringOptions(field, sandbox);
  }
};

const validateReferenceOptions = async (field, sandbox, mode = 'secure') => {
  if (mode !== 'secure') return;

  let foreignModel;
  const model = db.getModel(field.model);
  const { foreign_model, foreign_label, depends_on } = parseOptions(field.options);
  const errors = [];

  if (model.type === 'template') return;

  if (!foreign_model) {
    errors.push(sandbox.translate('static.should_provide_foreign_model', { field: field.name }));
  }

  if (!foreign_label) {
    errors.push(sandbox.translate('static.should_provide_foreign_label', { field: field.name }));
  }

  try {
    foreignModel = db.getModel(foreign_model).id;
  } catch (error) {
    errors.push(sandbox.translate('static.foreign_model_does_not_exist', { field: field.name, alias: foreign_model }));
  }

  if (isString(depends_on) && depends_on.length) {
    const aliasesD = parseOptions(depends_on, { silent: true });

    if (aliasesD.length) {
      if (foreignModel) {
        const aliasesS = await db.model('field').pluck('alias').where({ model: field.model, __inserted: true }).whereIn('alias', aliasesD);
        const aliasesF = await db.model('field').pluck('alias').where({ model: foreignModel, __inserted: true }).whereIn('alias', aliasesD);

        if (!every(aliasesD, (a) => aliasesS.includes(a) && aliasesF.includes(a))) {
          errors.push(sandbox.translate('static.field_contains_not_permitted_value_by_depends_on', { field: field.name }));
        }
      }
    } else {
      errors.push(sandbox.translate('static.depends_on_has_wrong_format', { field: field.name }));
    }
  }

  if (errors.length) throw new RecordNotValidError(errors.join('\n'));
};

const validateDatetimeOptions = (field, sandbox) => {
  const options = parseOptions(field.options);
  const { format } = options;

  if (format === GLOBAL_DATE_FORMAT) {
    field.options = { ...options, format: undefined };
    return;
  }
  const isValid = moment(moment().format(format), format).isValid();

  if (!isValid) throw new RecordNotValidError(sandbox.translate('static.datetime_has_wrong_format', { field: field.name }));
};

const validateArrayStringOptions = (field, sandbox) => {
  const { values } = parseOptions(field.options, { silent: true });
  const isValid = !isEmpty(isObject(values) ? values : parseOptions(values, { silent: true }));

  if (!isValid) throw new RecordNotValidError(sandbox.translate('static.field_has_invalid_json_value', { field: field.name }))
};

const validateGlobalReferenceOptions = (field, sandbox, mode = 'secure') => {
  if (mode !== 'secure') return;

  const { references } = parseOptions(field.options, { silent: true });
  const isValid = isArray(isObject(references) ? references : parseOptions(references, { silent: true }));

  if (!isValid) throw new RecordNotValidError(sandbox.translate('static.field_has_invalid_json_value', { field: field.name }))
};
