import { isNull, isUndefined } from 'lodash-es';

import * as VALUE_PROCESSORS from './types/index.js';

export default (field, operator, value, context) => {
  if (isNull(value) || isUndefined(value)) return value;

  return VALUE_PROCESSORS[field.type](field, operator, value, context);
};
