import { isString, isBoolean, isArray, isDate, isNaN } from 'lodash/lang';
import { isFloat, isPlainObject, parseNumber } from '../../../../../helpers';

export default (field, value) => {
  if (isDate(value)) value = +value;
  if (isArray(value)) value = +value;
  if (isFloat(value)) value = parseFloat(parseNumber(value));
  if (isString(value)) value = parseFloat(parseNumber(value));
  if (isBoolean(value)) value = +value;
  if (isPlainObject(value)) value = undefined;
  if (isNaN(value)) value = undefined;

  return value;
};
