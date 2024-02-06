import Promise from 'bluebird';
import { isNil, isString, isArray, get } from 'lodash-es';
import { parseOptions } from '../../../helpers/index.js';

export default async (value, field, sandbox, flags) => {
  const errors = [];

  await validateValuePresence(value, field, sandbox, flags, errors);
  await validateExtraValuesPresence(field, sandbox, flags, errors);

  if (errors.length) return errors;
};

async function validateValuePresence(value, field, sandbox, flags, errors) {
  const { subtype } = parseOptions(field.options);

  if (flags && !flags.flags.ex_save.checkMandatoryFields) return;
  if (!field.required_when_script) return;
  if (subtype === 'folder') return;
  if (!sandbox.executeScript(field.required_when_script, `field/${field.id}/required_when_script`, { modelId: field.model })) return;

  if (
    isNil(value) ||
    (isString(value) && !value.trim()) ||
    (isArray(value) && value.length === 0) ||
    ((field.type === 'journal') && !isString(value))
   ) {
    errors.push(sandbox.translate('static.field_cannot_be_blank', { field: field.name }));
  }
}

async function validateExtraValuesPresence(field, sandbox, flags, errors) {
  if (flags && !flags.flags.ex_save.checkMandatoryFields) return;
  if (field.marked_as_deleted) return;

  await Promise.each(field.extra_attributes || [], async (attribute) => {
    const values = get(sandbox.record.extraAttributes, `${field.alias}.__${(attribute || {}).type}`) || [];

    if (!attribute.required_when_extra || values.length) return;
    if (!sandbox.executeScript(attribute.required_when_extra, `extra_fields_attribute/${attribute.id}/required_when_extra`, { modelId: field.model })) return;

    errors.push(sandbox.translate(`static.${attribute.type}_for_field_cannot_be_empty`, { attributeName: attribute.name, fieldName: field.name }));
  });
}
