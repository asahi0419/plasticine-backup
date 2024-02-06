import integerGenerator from './integer';
import * as HELPERS from '../helpers';
import * as CONSTANTS from '../constants';
import { isJSValue } from '../../../../../../helpers';

export default (field, operator, value, humanize) => {
  const ev = HELPERS.escapeValue;
  const ehv = HELPERS.escapeHumanValue;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = HELPERS.prepareValue(field, operator, value, humanize);

  if (operator === 'contains') {
    return `${f} ${o} ${humanize ? ehv(value) : `'%${ev(value).replace(/%/g, '')}%'`}`;
  }

  if (operator === 'is_current_user') {
    return humanize
      ? `${f} is current user`
      : `${f} ${CONSTANTS.QUERY_OPERATORS['is']} 'js:p.currentUser.getValue("id")'`;
  }

  if (operator === 'is_not_current_user') {
    return humanize
      ? `${f} is not current user`
      : `${f} ${CONSTANTS.QUERY_OPERATORS['is_not']} 'js:p.currentUser.getValue("id")'`;
  }

  if (operator === 'contains_current_user') {
    return humanize
      ? `${f} contains current user`
      : `TRUE = 'js:p.currentUser.isBelongsToWorkgroup(p.record.getValue("${f.replace(/`/g, '')}"))'`;
  }

  return integerGenerator(field, operator, value, humanize);
};
