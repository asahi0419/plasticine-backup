import { keys, difference, isEmpty, isString, isNull } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';
import FA_ICONS from '../../../../assets/fa-icons.js';

export default (value, field, sandbox) => {
  const options = parseOptions(field.options);
  let { values = {}, multi_select: multi } = options;

  if (field.type === 'array_string') values = keys(values).map(v => multi ? `'${v}'` : v);
  if (field.type === 'fa_icon') values = FA_ICONS;

  if (isEmpty(options.values)) return;
  if (values.includes(value)) return;
  if (isNull(value) && isNull(options.default || null)) return;

  if (multi) {
    const valueAsArray = isString(value) ? value.split(',') : value.map(v => `'${v}'`);
    if (!difference(valueAsArray, values).length) return;
  }

  return sandbox.translate('static.field_must_have_one_of_the_values', {
    field: field.name,
    values: `${values.slice(0, 10).join(', ')}...`,
  });
};
