import moment from 'moment';

import { parseOptions, parseDateFormat } from '../../../../../../helpers';

export default (field) => (value) => {
  if (!value) return;

  const time = moment(value);
  const format = parseDateFormat(parseOptions(field.options));

  return time.format(format);
};
