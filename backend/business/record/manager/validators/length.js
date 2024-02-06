import { parseOptions } from '../../../helpers/index.js';
import { getSetting } from '../../../setting/index.js';

export const validateLength = (value, field, sandbox) => {
  const options = parseOptions(field.options);
  const length = options.length || 255;

  if (length === 'unlimited') return;

  if (value.length <= length) return;
  return sandbox.translate('static.field_cannot_be_longer_than_length', { field: field.name, length });
};

export const validateRTLSelectCount = (value, field, sandbox) => {
  const { rtl_select_field } = getSetting('limits');
  const length = rtl_select_field || 100;

  if (value.length <= length) return;
  return sandbox.translate('static.field_rtl_select_limit', { limit: length });
};
