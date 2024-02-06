import { isInteger, isBoolean, isArray, isDate, isString, isNaN } from 'lodash-es';

import { isPlainObject, isFloat, parseOptions } from '../../../../../helpers/index.js';

export default (field, value, options = {}) => {
  const { raw } = options;

  if (isDate(value)) value = undefined;
  if (isArray(value)) value = raw ? +value : undefined;
  if (isFloat(value)) value = raw ? parseInt(value) : undefined;
  if (isString(value)) value = raw ? parseInt(value) : ((parseOptions(value).model && parseOptions(value).id) ? parseOptions(value) : undefined);
  if (isInteger(value)) value = raw ? value : undefined;
  if (isBoolean(value)) value = undefined;
  if (isPlainObject(value)) value = (value.model && value.id) ? value : undefined;
  if (isNaN(value)) value = undefined;

  return value;
};
