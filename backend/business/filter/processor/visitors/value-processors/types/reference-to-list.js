import lodash from 'lodash-es';

import typecast from '../../../../../field/value/typecast/index.js';

export default (field, operator, value, context) => {
  if (lodash.isString(value) && value.includes('%')) return value;
  if (lodash.isString(value)) value = value.split(',');

  return typecast(field, value);
};
