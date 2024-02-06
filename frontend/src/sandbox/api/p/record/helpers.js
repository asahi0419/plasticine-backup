import lang from 'lodash/lang';
import { sortBy } from 'lodash/collection';
import moment from 'moment';

export const isEqual = (prevValue, currentValue, fieldType) => {
  if (lang.isArray(prevValue) && lang.isArray(currentValue)) {
    return lang.isEqual(sortBy(prevValue), sortBy(currentValue));
  }

  if (fieldType === 'datetime') {
    return moment(prevValue).isSame(moment(currentValue));
  }

  return lang.isEqual(prevValue, currentValue);
};
