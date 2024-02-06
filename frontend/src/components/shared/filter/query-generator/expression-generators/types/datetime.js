import moment from 'moment';
import { map } from 'lodash/collection';
import { isArray } from 'lodash/lang';

import * as HELPERS from '../helpers';
import { isJSValue } from '../../../../../../helpers';
import { ISO_DATE_FORMAT, DATE_INTERVALS } from '../../../../../../constants';

const validator = (v, h) => {
  if (h) return v;
  if (DATE_INTERVALS.includes(v)) return v;

  const value = moment(v).isValid() ? moment.utc(v) : moment.utc();
  return value.format(ISO_DATE_FORMAT);
};

const formatter = (v, h) => isJSValue(v) ? v : (v ? validator(v, h) : v);

export default (field, operator, value, humanize) => {
  if (value === '') return;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = `'${formatter(value, humanize)}'`;

  switch (operator) {
    case 'on':
    case 'not_on':
    case 'before':
    case 'before_on':
    case 'after':
    case 'after_on':
      return `${f} ${o} ${v}`;
    case 'between':
      if (isArray(value) && (value.length === 2)) {
        v = map(value, (v) => `'${formatter(v, humanize)}'`);
        return humanize
          ? `${f} between ${v[0]} and on ${v[1]}`
          : `${f} BETWEEN ${v[0]} AND ${v[1]}`;
      }
    case 'is_empty':
    case 'is_not_empty':
      return `${f} ${o}`;
  }
};
