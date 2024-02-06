import moment from 'moment';
import lodash from 'lodash'

import { isFloat, isPlainObject, parseNumber } from '../../../../../helpers';

export default (field, value) => {
  if (lodash.isArray(value)) value = +value;
  if (isFloat(value)) value = parseInt(parseNumber(value));
  if (lodash.isString(value)) {
    if ((value.includes('-') || value.includes('/')) && (lodash.isDate(value) || moment(value).isValid())) {
      value = value
    } else {
      value = parseInt(parseNumber(value)) ? parseInt(parseNumber(value)) : value
    }
  }
  if (lodash.isBoolean(value)) value = undefined;
  if (isPlainObject(value)) value = undefined;
  if (lodash.isNaN(value)) value = undefined;  

  return value;
};
