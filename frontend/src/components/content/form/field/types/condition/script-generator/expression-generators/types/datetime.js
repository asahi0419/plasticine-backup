import { isArray } from 'lodash/lang';
import { compact } from 'lodash/array';

import { isJSValue } from '../../helpers';
import QUERY_OPERATORS from '../../query-operators';

const generateValue = (v) => {
  if (!v) return v;
  if (isJSValue(v)) return `(${v.replace(/^js:/, '')})`;
  return v._isAMomentObject ? `new Date('${v.format()}')` : `new Date('${v}')`;
};

export default (field, operator, value) => {
  if (['on', 'not_on', 'before', 'before_on', 'after', 'after_on'].includes(operator)) {
    return `${field} ${QUERY_OPERATORS[operator]} ${generateValue(value)}`;
  }

  if (operator === 'between' && isArray(value) && compact(value).length === 2) {
    const formattedValue = value.map(generateValue);
    return `(${formattedValue[0]} <= ${field} && ${field} <= ${formattedValue[1]})`;
  }
};
