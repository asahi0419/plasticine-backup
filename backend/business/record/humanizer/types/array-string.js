import { map, isString, isArray } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';

export default (field, sandbox) => {
  const { options } = sandbox.translate(field, 'field', ['options']) || {};
  const { values = {}, multi_select: multi } = parseOptions(options);

  return (value) => {
    if (multi) {
      if (isString(value)) {
        try {
          value = parseOptions(value, { silent: true });
        } catch (e) {
          value = value.split(',');
        }
      }

      if (!isArray(value)) {
        return values[value];
      }

      if (!value) return null;
      return map(value, (v) => (values[v] || v));
    } else {
      return values[value] || value;
    }
  }
};
