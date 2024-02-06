import { keys } from 'lodash/object';

import { getOperators } from '../../../../../../../../shared/filter/operators';
import integerGenerator from './integer';

export default (field, operator, value) => {
  if (keys(getOperators('integer')).includes(operator)) {
    return integerGenerator(field, operator, value)
  }

  if (operator === 'contains_current_user') {
    return `p.currentUser.isBelongsToWorkgroup(${field})`;
  }

  if (operator === 'is_current_user') {
    return `${field} == p.currentUser.getValue('id')`;
  }

  if (operator === 'is_not_current_user') {
    return `${field} != p.currentUser.getValue('id')`;
  }

  // if (['belongs_to_group', 'does_not_belongs_to_group'].includes(operator)) {
  //   const notSymbol = operator === 'does_not_belongs_to_group' ? '!' : '';
  //   return `${notSymbol}p.currentUser.isBelongsToWorkgroup(${field})`;
  // }
};
