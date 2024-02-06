import { isString } from 'lodash-es';

import typecast from '../../../../../field/value/typecast/index.js';
import { parseOptions } from '../../../../../helpers/index.js';

export default (field, operator, value, context) => {
  const { multi_select: multi } = parseOptions(field.options);

  if (multi) {
    if (isString(value)) {
      value = value.replace(/%/g, '').split(',');
    }

    value = typecast(field, value);
  }

  return value;
};
