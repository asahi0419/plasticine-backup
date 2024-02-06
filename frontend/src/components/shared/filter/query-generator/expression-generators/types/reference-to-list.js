import { isArray, isString, isEmpty } from 'lodash/lang';
import { compact } from 'lodash/array';
import { map } from 'lodash/collection';

import * as HELPERS from '../helpers';
import { isJSValue } from '../../../../../../helpers';

export default (field, operator, value, humanize) => {
  if (value === '') return;

  if (isString(value) && !isJSValue(value)) value = value.split(',');

  const ev = HELPERS.escapeValue;
  const ehv = HELPERS.escapeHumanValue;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = HELPERS.prepareValue(field, operator, value, humanize);

  switch (operator) {
    case 'is_empty':
    case 'is_not_empty':
      return `${f} ${o}`;
    case 'is':
    case 'is_not':
    case 'contains_one_of':
    case 'in_having':
    case 'not_in_having':
    case 'in_strict':
    case 'not_in_strict':
      if (isEmpty(compact(v))) return;
      if (isJSValue(v)) return `${f} ${o} '${v}'`;

      if (['is', 'is_not'].includes(operator)) {
        v = humanize ? ehv(v.join(', ')) : `'${ev(v)}'`;
        return `${f} ${o} ${v}`;
      }

      if (isArray(v)) v = v.join(',');
      if (isString(v)) v = compact(map(v.split(','), (v) => humanize ? ehv(v) : `${ev(v)}`));
      if (humanize) v = v.join(', ');

      return `${f} ${o} (${v})`;
    case 'like':
    case 'not_like':
      v = humanize ? ehv(value) : `'%${ev(value).replace(/%/g, '')}%'`;
      return `${f} ${o} ${v}`;
  }
};
