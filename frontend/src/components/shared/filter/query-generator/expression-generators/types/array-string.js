import { isArray, isString, isEmpty } from 'lodash/lang';
import { compact } from 'lodash/array';
import { map } from 'lodash/collection';

import stringGenerator from './string';
import * as HELPERS from '../helpers';
import { parseOptions, isJSValue } from '../../../../../../helpers';

export default (field, operator, value, humanize) => {
  const { multi_select: multi } = parseOptions(field.options);

  if (multi) {
    const ev = HELPERS.escapeValue;
    const ehv = HELPERS.escapeHumanValue;

    let f = HELPERS.prepareField(field, operator, humanize);
    let o = HELPERS.prepareOperator(operator, humanize);
    let v = HELPERS.prepareValue(field, operator, value, humanize);

    switch (operator) {
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
        if (isString(v)) v = compact(map(v.split(','), (v) => humanize ? ehv(v) : `'${ev(v)}'`));
        if (humanize) v = v.join(', ');

        return `${f} ${o} (${v})`;
    }
  }

  return stringGenerator(field, operator, value, humanize);
};
