import QUERY_OPERATORS from '../../query-operators';
import { isJSValue } from '../../helpers';

export default (field, operator, value) => {
  const jsValue = isJSValue(value) && `(${value.replace(/^js:/, '')})`;

  if (jsValue) return `${field} ${QUERY_OPERATORS[operator]} ${jsValue}`;

  const isTrue = ['true', true].includes(value);

  if (operator === 'is') return isTrue ? field : `!${field}`;
  if (operator === 'is_not') return isTrue ? `!${field}` : field;
};
