import moment from 'moment';
import { compact, isString, isArray, isDate, isNumber } from 'lodash-es';

import { isPlainObject } from '../../../../../helpers/index.js';

export default (field, value) => {
  if (isDate(value)) value = moment(value).isValid();
  if (isArray(value)) value = !!compact(value).length;
  if (isNumber(value)) value = (value != 0);
  if (isString(value)) value = (value.trim() === 'true');
  if (isPlainObject(value)) value = undefined;

  return value;
};
