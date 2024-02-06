import { isString, isUndefined } from 'lodash/lang';

import * as HELPERS from '../helpers';
import { isJSValue, isPlainObject } from '../../../../../../helpers';

const formatter = (v) => {
  if (isJSValue(v)) {
    return `'${v.replace(/'/g, '"')}'`;
  } else if (isString(v)) {
    return `'${HELPERS.escapeValue(v)}'`;
  } else if (isPlainObject(v) && v.model && v.id) {
    return `'${v.model}/${v.id}'`;
  }
};

export default (field, operator, value, humanize) => {
  if (value === '') return;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = formatter(value);

  if (isUndefined(v)) return;

  return `${f} ${o} ${v}`;
};
