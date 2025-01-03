export const QUERY_OPERATORS = {
  is: '=',
  is_not: '!=',
  is_empty: 'IS NULL',
  is_not_empty: 'IS NOT NULL',
  in: 'IN',
  in_strict: 'IN',
  in_having: 'IN',
  not_in: 'NOT IN',
  not_in_strict: 'NOT IN',
  not_in_having: 'NOT IN',
  starts_with: 'LIKE',
  does_not_start_with: 'NOT LIKE',
  ends_with: 'LIKE',
  does_not_end_with: 'NOT LIKE',
  contains: 'LIKE',
  does_not_contain: 'NOT LIKE',
  less_than: '<',
  greater_than: '>',
  less_than_or_is: '<=',
  greater_than_or_is: '>=',
  on: '=',
  not_on: '!=',
  before: '<',
  before_on: '<=',
  after: '>',
  after_on: '>=',
  contains_one_of: 'IN',
  like: 'like',
  not_like: 'not like',
};

export const HUMAN_OPERATORS = {
  is: '=',
  is_not: '!=',
  is_empty: 'is empty',
  is_not_empty: 'is not empty',
  in: 'in',
  in_strict: 'in (strict)',
  in_having: 'contains',
  not_in: 'not in',
  not_in_strict: 'not in (strict)',
  not_in_having: 'does not contain',
  starts_with: 'starts with',
  does_not_start_with: 'does not start with',
  ends_with: 'ends with',
  does_not_end_with: 'does not end with',
  contains: 'contains',
  does_not_contain: 'does not contain',
  less_than: '<',
  greater_than: '>',
  less_than_or_is: '<=',
  greater_than_or_is: '>=',
  on: 'on',
  not_on: 'not on',
  before: 'before',
  before_on: 'before on',
  after: 'after',
  after_on: 'after on',
  contains_one_of: 'contains one of',
  like: 'like',
  not_like: 'not like',

  belongs_to_group: 'belongs to "__value__" workgroup',
  does_not_belongs_to_group: 'does not belong to "__value__" workgroup',
  has_administrator_privilege: 'is admin',
  has_read_privilege: 'can at least read',
  has_read_write_privilege: 'can at least read-write',
};

export const STRIGIFY_ARRAY_OPERATORS = [
  'contains',
  'does_not_contain',
];

export const JOIN_ARRAY_OPERATORS = [
  'in',
  'not_in',
  'in_strict',
  'not_in_strict',
  'in_having',
  'not_in_having',
  'contains_one_of',
];
