import { isEmpty, isArray } from 'lodash/lang';

import { parseOptions } from '../../../../../../helpers';

export default (field) => {
  const options = parseOptions(field.options);

  return (value) => {
    if (value && options.values) {
      if (options.multi_select) {
        if (isArray(value)) {
          if (isEmpty(value)) return null;
        } else {
          value = value.split(',');
        }

        return value.map((v) => options.values[v]);
      }
      return options.values[value];
    }
    return value;
  }
};
