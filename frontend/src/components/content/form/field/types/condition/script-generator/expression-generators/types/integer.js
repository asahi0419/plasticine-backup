import { isArray } from 'lodash/lang';
import { compact } from 'lodash/array';

import { isJSValue } from '../../helpers';
import QUERY_OPERATORS from '../../query-operators';

const generateValue = (v) => isJSValue(v) ? `(${v.replace(/^js:/, '')})` : v;

export default (field, operator, value) => {

  if (['is', 'is_not', 'less_than', 'greater_than', 'less_than_or_is', 'greater_than_or_is'].includes(operator)) {
    return `${field} ${QUERY_OPERATORS[operator]} ${generateValue(value)}`;
  }

  if (['in', 'not_in'].includes(operator)) {
    const notSymbol = operator === 'not_in' ? '!' : '';

    if (isJSValue(value)) {
      return `${notSymbol}${generateValue(value)}.includes(${field})`;
    }

    const arrayValue = (isArray(value) ? value : value.toString().split(',')).map((v) => Number(v));
    return `${notSymbol}${JSON.stringify(arrayValue)}.includes(${field})`;
  }

  if (operator === 'between' && isArray(value) && compact(value).length === 2) {
    const formattedValue = value.map(generateValue);
    return `(${formattedValue[0]} <= ${field} && ${field} <= ${formattedValue[1]})`;
  }
};
