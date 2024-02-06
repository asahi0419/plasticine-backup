import { isNumber, isBoolean, isArray, isDate, isString } from 'lodash/lang';
import { isPlainObject, parseOptions } from '../../../../../helpers';
import { map } from 'lodash/collection';

import stringProcessor from '../string';

export default (field = {}, value) => {
  const { multi_select: multi } = parseOptions(field.options);

  if (multi) {
    if (isDate(value)) value = [`${+value}`];
    if (isArray(value)) value = map(value, (v) => isString(v) ? v : `${v}`);
    if (isString(value)) value = [value];
    if (isNumber(value)) value = [`${value}`];
    if (isBoolean(value)) value = [`${value}`];
    if (isPlainObject(value)) value = [JSON.stringify(value)];

    return value;
  }

  return stringProcessor(field, value);
};
