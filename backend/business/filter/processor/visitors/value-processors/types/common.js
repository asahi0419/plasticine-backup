import { isArray, map } from 'lodash-es';

import typecast from '../../../../../field/value/typecast/index.js';

export default (field, operator, value, context) => {
  if (isArray(value)) return map(value, (v) => typecast(field, v));

  return typecast(field, value);
};
