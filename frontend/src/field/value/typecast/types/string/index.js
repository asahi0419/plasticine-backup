import { isNumber, isBoolean, isArray, isDate } from 'lodash/lang';
import { isPlainObject } from '../../../../../helpers';

export default (field, value) => {
  if (isDate(value)) value = `${+value}`;
  if (isArray(value)) value = JSON.stringify(value);
  if (isNumber(value)) value = `${value}`;
  if (isBoolean(value)) value = `${value}`;
  if (isPlainObject(value)) value = JSON.stringify(value);

  return value;
};
