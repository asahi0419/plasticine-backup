import moment from 'moment';
import { isBoolean, isNil, isArray, isDate, isString } from 'lodash/lang';

import * as HELPERS from '../helpers';
import { isJSValue } from '../../../../../../helpers';

const isHumanized = (v) => {
  return [i18n.t('yes'), i18n.t('no'), 'Yes', 'No'].includes(v);
};

export default (field, operator, value, humanize) => {
  if (value === '') return;

  let f = HELPERS.prepareField(field, operator, humanize);
  let o = HELPERS.prepareOperator(operator, humanize);
  let v = HELPERS.prepareValue(field, operator, value, humanize);

  switch (operator) {
    case 'is':
    case 'is_not':
      if (isNil(v)) return;
      if (isHumanized(value)) return `${f} ${o} ${value}`;
      if (isJSValue(v)) return `${f} ${o} '${v}'`;
      if (isBoolean(v)) return `${f} ${o} ${v}`;
      if (isArray(v)) return `${f} ${o} ${!!v.length}`;
      if (isDate(v)) return `${f} ${o} ${moment(v).isValid()}`;
      if (isString(v)) return;
    case 'is_empty':
    case 'is_not_empty':
      return `${f} ${o}`;
  }
};
