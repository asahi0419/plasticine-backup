import { map, isNumber, isBoolean, isArray, isDate, isString } from 'lodash-es';
import { isPlainObject, parseOptions } from '../../../../../helpers/index.js';

import stringProcessor from '../string/index.js';

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
