import { isString } from 'lodash-es';
import { parseOptions } from '../../../../../helpers/index.js';

export default (field, value) => {
  if (isString(value)) value = value.length ? parseOptions(value) : undefined;

  return value;
};
