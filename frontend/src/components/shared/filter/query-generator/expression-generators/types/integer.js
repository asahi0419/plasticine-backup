import { isArray, isNil, isEmpty } from 'lodash/lang';
import { compact } from 'lodash/array';
import { map } from 'lodash/collection';

import * as HELPERS from '../helpers';
import * as CONSTANTS from '../constants';
import { isJSValue, parseNumber } from '../../../../../../helpers';

export default (field, operator, value, humanize) => {
  if (value === '') return;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = HELPERS.prepareValue(field, operator, value, humanize);

  switch (operator) {
    case 'is_empty':
    case 'is_not_empty':
      return `${f} ${o}`;
  }

  if (isNil(v)) return;
  if (isJSValue(v)) return `${f} ${o} '${v}'`;

  switch (operator) {
    case 'is':
    case 'is_not':
    case 'less_than':
    case 'greater_than':
    case 'less_than_or_is':
    case 'greater_than_or_is':
      return `${f} ${o} ${v}`;
    case 'in':
    case 'not_in':
      if (isEmpty(v)) return;
      return `${f} ${o} (${v})`;
    case 'between':
      if (isArray(v) && (v.length === 2)) {
        return humanize
          ? `${f} between ${v[0]} and on ${v[1]}`
          : `${f} BETWEEN ${v[0]} AND ${v[1]}`;
      }
  }
};
