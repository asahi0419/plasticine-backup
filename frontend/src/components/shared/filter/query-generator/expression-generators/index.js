import * as HELPERS from './helpers';
import * as EXPRESSION_GENERATORS from './types';

export default (field, operator, value, humanize) => {
  const generator = EXPRESSION_GENERATORS[field.type];
  if (!generator) return;
  return generator(field, operator, value, humanize);
}
