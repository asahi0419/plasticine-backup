import { isJSValue } from '../../helpers';

export default (field, operator, v) => {
  const value = isJSValue(v) ? `(${v.replace(/^js:/, '')})` : `[${v.join(',')}]`;

  switch (operator) {
    case 'is':
      return `${field} == ${value}`;
    case 'is_not':
      return `${field} != ${value}`;
    case 'contains_one_of':
      return `${field}.some((v) => ${value}.includes(v))`;
    case 'in_having':
      return `${value}.every((v) => ${field}.includes(v))`;
    case 'not_in_having':
      return `!${value}.every((v) => ${field}.includes(v))`;
    case 'in_strict':
      return `${field}.every((v) => ${value}.includes(v))`;
    case 'not_in_strict':
      return `!${field}.every((v) => ${value}.includes(v))`;
  }
};
