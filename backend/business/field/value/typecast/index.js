import logger from '../../../logger/index.js';

import * as TYPES from './types/index.js';
import * as HELPERS from './helpers/index.js';

export default (field = {}, value, options) => {
  if (HELPERS.shouldReturnUndefined(value)) return;
  if (HELPERS.shouldReturnAsIs(value)) return value;

  try {
    const processor = TYPES[field.type] || TYPES.common;
    const result = processor(field, value, options);

    return result;
  } catch (error) {
    logger.error(error);

    return undefined;
  }
};
