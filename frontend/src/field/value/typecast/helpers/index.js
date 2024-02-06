import { isNull, isUndefined, isNaN, isError, isFunction, isRegExp } from 'lodash/lang';

export const shouldReturnUndefined = (value) => {
  return isNaN(value) ||
         isError(value) ||
         isRegExp(value) ||
         isFunction(value) ||
         isUndefined(value);
};

export const shouldReturnAsIs = (value) => {
  return isNull(value);
};
