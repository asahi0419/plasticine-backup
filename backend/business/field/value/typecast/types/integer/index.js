import { isString, isBoolean, isArray, isDate, isNaN } from 'lodash-es';

import { isFloat, isPlainObject, parseNumber } from '../../../../../helpers/index.js';

export default (field, value) => {
  if (isDate(value)) value = +value;
  if (isArray(value)) value = +value;
  if (isFloat(value)) value = parseInt(parseNumber(value));
  if (isString(value)) value = parseInt(parseNumber(value));
  if (isBoolean(value)) value = +value;
  if (isPlainObject(value)) value = undefined;
  if (isNaN(value)) value = undefined;

  return value;
};
