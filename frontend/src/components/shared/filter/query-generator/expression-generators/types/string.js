import { isEmpty, isArray, isString, isDate, isNil } from 'lodash/lang';
import { compact } from 'lodash/array';
import { map } from 'lodash/collection';

import * as HELPERS from '../helpers';
import { isJSValue, parseOptions } from '../../../../../../helpers';

export default (field, operator, value, humanize) => {
  const ev = HELPERS.escapeValue;
  const ehv = HELPERS.escapeHumanValue;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = HELPERS.prepareValue(field, operator, value, humanize);

  if (isNil(v)) v = '';

  if (['in', 'not_in'].includes(operator)) {
    if (isArray(parseOptions(v))) v = parseOptions(v);
    if (isArray(v)) v = v.join(',');
    if (isString(v)) {
      if (isJSValue(v)) {
        v = humanize ? ehv(v) : `'${ev(v)}'`;
      } else {
        v = compact(map(v.split(','), (v) => humanize ? ehv(v) : `'${ev(v)}'`));
      }
    }
    if (isDate(v)) v = `'${v}'`;
  } else {
    if (isArray(v)) v = JSON.stringify(v);
  }

  switch (operator) {
    case 'is':
    case 'is_not':
      v = humanize ? ehv(v) : `'${ev(v)}'`;
      return `${f} ${o} ${v}`;
    case 'is_empty':
    case 'is_not_empty':
      return `${f} ${o}`;
    case 'in':
    case 'not_in':
      if (isJSValue(value)) return `${f} ${o} ${v}`;
      return `${f} ${o} (${v})`;
    case 'starts_with':
    case 'does_not_start_with':
      v = humanize ? ehv(v) : `'${ev(v).replace(/%/g, '')}%'`;
      return `${f} ${o} ${v}`;
    case 'ends_with':
    case 'does_not_end_with':
      v = humanize ? ehv(v) : `'%${ev(v).replace(/%/g, '')}'`;
      return `${f} ${o} ${v}`;
    case 'contains':
    case 'does_not_contain':
      v = humanize ? ehv(v) : `'%${ev(v).replace(/%/g, '')}%'`;
      return `${f} ${o} ${v}`;
  }
};
