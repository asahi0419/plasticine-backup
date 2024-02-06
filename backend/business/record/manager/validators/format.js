import moment from 'moment';
import { parseOptions, parseDateFormat } from '../../../helpers/index.js';

export const validateFormat = (value, field, sandbox) => {
  const { format } = parseOptions(field.options);
  if (!format) return;
  if (new RegExp(format).test(value)) return;

  return sandbox.translate('static.field_has_wrong_format', { field: field.name });
};

export const validateDatetimeFormat = (value, field, sandbox) => {
  const format = parseDateFormat(parseOptions(field.options));

  if (moment(value, [format, moment.ISO_8601], true).isValid()) return;
  return sandbox.translate('static.field_has_wrong_format', { field: field.name });
};
