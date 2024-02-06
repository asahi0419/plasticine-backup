import lodash from 'lodash';

import commonProcessor from './common.js';

export default (field, operator, value, context) => {
  if (lodash.isString(value) && value.includes('%')) return value;
  if (lodash.isArray(value)) {
    if (operator === 'between') return commonProcessor(field, operator, value, context);
    return value 
  }

  return commonProcessor(field, operator, value, context);
};
