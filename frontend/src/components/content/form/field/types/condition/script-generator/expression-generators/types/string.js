import { isArray } from 'lodash/lang';

import QUERY_OPERATORS from '../../query-operators';
import { isJSValue } from '../../helpers';

export default (field, operator, value) => {
  const preparedValue = isJSValue(value) ? `(${value.replace(/^js:/, '')})` : `'${value}'`;

  switch (operator) {
    case 'is':
    case 'is_not':
      return `${field} ${QUERY_OPERATORS[operator]} ${preparedValue}`;
    case 'in':
    case 'not_in':
      const notSymbol = operator === 'not_in' ? '!' : '';
      if (isJSValue(value)) {
        return `${notSymbol}${preparedValue}.includes(${field})`;
      }
      const arrayValue = isArray(value) ? value : value.toString().split(',');
      return `${notSymbol}${JSON.stringify(arrayValue)}.includes(${field})`;
    case 'starts_with':
      return `${field}.startsWith(${preparedValue})`;
    case 'does_not_start_with':
      return `!${field}.startsWith(${preparedValue})`;
    case 'ends_with':
      return `${field}.endsWith(${preparedValue})`;
    case 'does_not_end_with':
      return `!${field}.endsWith(${preparedValue})`;
    case 'contains':
      return `${field}.includes(${preparedValue})`;
    case 'does_not_contain':
      return `!${field}.includes(${preparedValue})`;
  }
};
