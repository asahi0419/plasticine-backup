import { isInteger, isBoolean, isArray, isDate, isString } from 'lodash/lang';
import { isPlainObject, isFloat, parseOptions } from '../../../../../helpers';
import { map } from 'lodash/collection';

export default (field, value) => {
  if (isDate(value)) value = undefined;
  if (isArray(value)) value = map(value, (v) => isInteger(v) ? v : parseInt(v));
  if (isFloat(value)) value = [parseInt(value)];
  if (isString(value)) value = isArray(parseOptions(value)) ? map(parseOptions(value), (v) => isInteger(v) ? v : parseInt(v)) : undefined;
  if (isInteger(value)) value = [value];
  if (isBoolean(value)) value = undefined;
  if (isPlainObject(value)) value = undefined;

  return value;
};
