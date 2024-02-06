import { omit } from 'lodash/object';
import { isNil } from 'lodash/lang';

import store from '../../../store';

const availablePrimaryKeyOperators = {
  is: 'is',
  is_not: 'is not',
  in: 'in',
  not_in: 'not in',
  less_than: 'less than',
  less_than_or_is: 'less than or is',
  greater_than: 'greater than',
  greater_than_or_is: 'greater than or is',
  between: 'between',
};

const availableStringOperators = {
  is: 'is',
  is_not: 'is not',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  in: 'in',
  not_in: 'not in',
  contains: 'contains',
  does_not_contain: 'does not contain',
  starts_with: 'starts with',
  does_not_start_with: 'does not start with',
  ends_with: 'ends with',
  does_not_end_with: 'does not end with',
};

const availableDateTimeOperators = {
  on: 'on',
  not_on: 'not on',
  before: 'before',
  before_on: 'before on',
  after: 'after',
  after_on: 'after on',
  between: 'between',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

const availableReferenceOperators = {
  is: 'is',
  is_not: 'is not',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  in: 'in',
  not_in: 'not in',
  contains: 'contains',
  between: 'between'
};

const availableGlobalReferenceOperators = {
  is: 'is',
  is_not: 'is not',
};

const availableArrayOperators = () => {
  const baseOperators = {
    is: 'is',
    is_not: 'is not',
    is_empty: 'is empty',
    is_not_empty: 'is not empty',
    contains_one_of: 'contains one of',
  };

  const db = store.redux.state('app.settings.db_provider');
  if (db === 'mysql') return baseOperators;

  return {
    ...baseOperators,
    in_having: 'contains',
    not_in_having: 'does not contain',
    in_strict: 'in (strict)',
    not_in_strict: 'not in (strict)',
  };
};

const availableBooleantOperators = {
  is: 'is',
  is_not: 'is not',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
};

const availableIntegerOperators = {
  is: 'is',
  is_not: 'is not',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  in: 'in',
  not_in: 'not in',
  less_than: 'less than',
  greater_than: 'greater than',
  less_than_or_is: 'less than or is',
  greater_than_or_is: 'greater than or is',
  between: 'between',
};

const availableTrueStubOperators = {
  is: 'is',
};

const availableBooleanStubOperators = {

};

const availableCurrentUserOperators = {
  belongs_to_group: 'belongs to group',
  does_not_belongs_to_group: 'does not belongs to group',
  has_administrator_privilege: 'has at least administrator privilege',
  has_read_privilege: 'has at least read privilege',
  has_read_write_privilege: 'has at least read-write privilege',
};

const availableUserOperators = {
  is_current_user: 'is current user',
  is_not_current_user: 'is not current user',
  // belongs_to_group: 'belongs to group',
  // does_not_belongs_to_group: 'does not belongs to group',
};

const availableUserGroupOperators = {
  contains_current_user: 'contains current user',
};

export const noValueOperators = [
  'is_empty',
  'is_not_empty',
  'has_administrator_privilege',
  'has_read_privilege',
  'has_read_write_privilege',
  'is_current_user',
  'is_not_current_user',
  'contains_current_user',
];

export const getOperators = (type) => {
  const operators = {
    primary_key: availablePrimaryKeyOperators,
    datetime: availableDateTimeOperators,
    reference: availableReferenceOperators,
    global_reference: availableGlobalReferenceOperators,
    boolean: availableBooleantOperators,
    true_stub: availableTrueStubOperators,
    boolean_stub: availableBooleanStubOperators,
    current_user: availableCurrentUserOperators,
    user: availableUserOperators,
    user_group: availableUserGroupOperators,
    reference_for_condition: omit(availableReferenceOperators, 'contains'),
  };

  switch (type) {
    case 'integer':
    case 'float':
      return availableIntegerOperators;
    case 'reference_to_list':
      return {
        ...availableArrayOperators(),
        like: 'like',
        not_like: 'not like',
      };
    case 'array_string_multi_select':
      return availableArrayOperators();
    default:
      return operators[type] || availableStringOperators;
  }
};

const base = (operator, value, mode) => {
  if (['=', 'is'].includes(operator)) {
    if (value === 'js:p.currentUser.getValue("id")') {
      return 'is_current_user'
    }
    return !isNil(value) ? 'is' : 'is_empty';
  }

  if (['!=', 'is not'].includes(operator)) {
    if (value === 'js:p.currentUser.getValue("id")') {
      return 'is_not_current_user'
    }
    return !isNil(value) ? 'is_not' : 'is_not_empty';
  }
  
  if (operator === 'in' && mode === 'strict')     return `in_strict`;
  if (operator === 'in')                          return 'in';
  if (operator === 'not in' && mode === 'strict') return `not_in_strict`;
  if (operator === 'not in')                      return 'not_in';
};

const primary_key = (operator) => {
  if (['=', 'is'].includes(operator))      return 'is';
  if (['!=', 'is not'].includes(operator)) return 'is_not';
  if (operator === 'in')                   return 'in';
  if (operator === 'not in')               return 'not_in';
  if (operator === '<')                    return 'less_than';
  if (operator === '<=')                   return 'less_than_or_is';
  if (operator === '>')                    return 'greater_than';
  if (operator === '>=')                   return 'greater_than_or_is';
  if (operator === 'between')              return 'between';
};

const string = (operator, value, mode) => {
  const baseOperand = base(operator, value, mode);
  if (baseOperand)                        return baseOperand;

  if (operator === 'like') {
    if (/^%.*%$/.test(value))             return 'contains';
    if (/.*%$/.test(value))               return 'starts_with';
    if (/^%.*/.test(value))               return 'ends_with';
  }

  if (operator === 'not like') {
    if (/^%.*%$/.test(value))             return 'does_not_contain';
    if (/.*%$/.test(value))               return 'does_not_start_with';
    if (/^%.*/.test(value))               return 'does_not_end_with';
  }
};

const datetime = (operator, value) => {
  if (!value) {
    if (['=', 'is'].includes(operator))      return 'is_empty';
    if (['!=', 'is not'].includes(operator)) return 'is_not_empty';
  }

  if (['=', 'is'].includes(operator))      return 'on';
  if (['!=', 'is not'].includes(operator)) return 'not_on';
  if (operator === '<')                    return 'before';
  if (operator === '<=')                   return 'before_on';
  if (operator === '>')                    return 'after';
  if (operator === '>=')                   return 'after_on';
  if (operator === 'between')              return 'between';
};

const reference = (operator, value) => {
  const baseOperand = base(operator, value);
  if (baseOperand)                        return baseOperand;

  if (operator === 'like') {
    if (/^%.*%$/.test(value))             return 'contains';
  }
  if (operator === 'between')             return 'between';
};

const reference_to_list = (operator, value, mode) => {
  if (value === null) {
    if (['=', 'is'].includes(operator))      return 'is_empty';
    if (['!=', 'is not'].includes(operator)) return 'is_not_empty';
  }

  if (['=', 'is'].includes(operator))      return 'is';
  if (['!=', 'is not'].includes(operator)) return 'is_not';

  if (operator === 'in' && mode === 'strict')     return `in_strict`;
  if (operator === 'in' && mode === 'having')     return `in_having`;

  if (operator === 'in')                          return 'contains_one_of';

  if (operator === 'not in' && mode === 'strict') return `not_in_strict`;
  if (operator === 'not in' && mode === 'having') return `not_in_having`;

  if (operator === 'like') return `like`;
  if (operator === 'not like') return `not_like`;
};

const boolean = (operator, value) => {
  if (value === null) {
    if (['=', 'is'].includes(operator))      return 'is_empty';
    if (['!=', 'is not'].includes(operator)) return 'is_not_empty';
  }

  if (['=', 'is'].includes(operator))        return 'is';
  if (['!=', 'is not'].includes(operator))   return 'is_not';
};

const integer = (operator, value) => {
  const baseOperand = base(operator, value);
  if (baseOperand)                        return baseOperand;

  if (operator === '<')                    return 'less_than';
  if (operator === '<=')                   return 'less_than_or_is';
  if (operator === '>')                    return 'greater_than';
  if (operator === '>=')                   return 'greater_than_or_is';
  if (operator === 'between')              return 'between';
};

const current_user = (operator, value) => {
  return operator;
};

export const getExtractor = (type) => {
  const extractors = {
    boolean,
    current_user,
    datetime,
    reference,
    reference_to_list,
    primary_key,
  };

  switch (type) {
    case 'integer':
    case 'float':
      return integer;
    case 'true_stub':
    case 'global_reference':
      return base;
    default:
      return extractors[type] || string;
  }
}
