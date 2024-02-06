import moment from 'moment-timezone';
import { isDate, isString } from 'lodash-es';

import { parseOptions, parseDateFormat } from '../../../helpers/index.js';
import { getSetting } from '../../../setting/index.js';
import { DATE_INTERVALS } from '../../../constants/index.js';

const DEFAULT_FLAGS = {
  useGlobalFormat: false
};

export default (field, sandbox) => (value, flags = DEFAULT_FLAGS) => {
  if (!value) return;

  if (isString(value) && DATE_INTERVALS.includes(value)) { 
    return value;
  }

  if (!isDate(value) && isString(value)) {
    value = new Date(value).toString() === 'Invalid Date' ? 'Invalid Date' : new Date(value);
  }

  const options = parseOptions(field.options);
  const fieldFormat = parseDateFormat(options);
  const globalFormat = getSetting('format');
  const format = flags.useGlobalFormat ? globalFormat.field_date_notime : fieldFormat
  const utcOffset = sandbox.timeZoneOffset || 0;

  return moment(value).utcOffset(utcOffset).format(format);
};
