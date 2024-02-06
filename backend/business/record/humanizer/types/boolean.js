import { isNull, isBoolean } from 'lodash-es';

import { parseOptions } from '../../../helpers/index.js';

export default (field, sandbox) => {
  return (value) => {
    if (isNull(value)) return 'Null';

    const parsedValue = parseOptions(value);

    if (isBoolean(parsedValue)) {
      return parsedValue ? sandbox.translate('static.yes') : sandbox.translate('static.no');
    }

    return sandbox.translate('static.no');
  };
}
