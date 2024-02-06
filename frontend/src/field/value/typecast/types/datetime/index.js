import moment from 'moment';

import { isNumber, isBoolean, isArray, isString } from 'lodash/lang';
import { isPlainObject } from '../../../../../helpers';

export default (field, value) => {
  if (isArray(value)) value = undefined;
  if (isNumber(value)) value = new Date(value);
  if (isString(value)) value = moment(new Date(value)).isValid() ? new Date(value) : undefined;
  if (isBoolean(value)) value = undefined;
  if (isPlainObject(value)) value = undefined;

  return value;
};
