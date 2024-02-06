import lodash from 'lodash-es';
import moment from 'moment';

export const isEqual = (prevValue, currentValue, fieldType) => {
  if (lodash.isArray(prevValue) && lodash.isArray(currentValue)) {
    return lodash.isEqual(lodash.sortBy(prevValue), lodash.sortBy(currentValue));
  }

  if (fieldType === 'datetime') {
    return moment(prevValue).isSame(moment(currentValue));
  }

  if (fieldType === 'integer') {
    return toInt(prevValue) === toInt(currentValue);
  }

  return lodash.isEqual(prevValue, currentValue);
};

const toInt = (value) => {
  return value || value === 0 ? Number(value) : null;
};
