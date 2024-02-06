import moment from 'moment';

import { isString, isArray, isDate, isNumber } from 'lodash/lang';
import { isPlainObject } from '../../../../../helpers';
import { compact } from 'lodash/array';

export default (field, value) => {
  if (isDate(value)) value = moment(value).isValid();
  if (isArray(value)) value = !!compact(value).length;
  if (isNumber(value)) value = (value != 0);
  if (isString(value)) value = (value.trim() === 'true');
  if (isPlainObject(value)) value = undefined;

  return value;
};
