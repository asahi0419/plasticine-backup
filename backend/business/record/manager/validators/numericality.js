import { isNaN, isNil } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';

const isPureNumber = v => !isNaN(Number(v));
const isFloat = n => parseFloat(n) % 1 !== 0;

const NUMERICAL_PARSERS = {
  integer: v => (isPureNumber(v) && !isFloat(v) ? parseInt(v) : NaN),
  float: v => (isPureNumber(v) ? parseFloat(v) : NaN),
};

export const validateNumericality = (value, field, sandbox) => {
  if (isNil(value)) return;
  const parsedValue = NUMERICAL_PARSERS[field.type](value);
  if (!isNaN(parsedValue)) return;

  return sandbox.translate(`static.field_must_be_an_${field.type}`, { field: field.name });
};

export const validateRanges = (value, field, sandbox) => {
  if (isNil(value)) return;
  let { min, max, step, use_null } = parseOptions(field.options);

  if (step || use_null) {
    min = min || 0;
    max = max || 100;
  }

  if (!isNil(min) && (value < min)) {
    return sandbox.translate('static.field_is_less_than_min', { field: field.name, min });
  }

  if (!isNil(max) && (value > max)) {
    return sandbox.translate('static.field_is_greater_than_max', { field: field.name, max });
  }

  if (!isNil(min) && !isNil(max) && isNil(value)) {
    return sandbox.translate('static.field_cannot_be_blank', { field: field.name });
  }
};
