import { isNumber, isBoolean, isArray, isDate } from 'lodash-es';

import { isPlainObject } from '../../../../../helpers/index.js';

export default (field, value) => {
  if (isDate(value)) value = `${+value}`;
  if (isArray(value)) value = JSON.stringify(value);
  if (isNumber(value)) value = `${value}`;
  if (isBoolean(value)) value = `${value}`;
  if (isPlainObject(value)) value = JSON.stringify(value);

  return value;
};
