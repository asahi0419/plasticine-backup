import * as CONSTANTS from '../constants';

export default (field, operator, value, humanize) => {
  if (humanize) {
    const f = 'Current user';
    const o = (CONSTANTS.HUMAN_OPERATORS[operator] || 'undefined operator').replace('__value__', value);
    return `${f} ${o}`;
  }

  return console.error('Current user is not supported for generating filters');
};
