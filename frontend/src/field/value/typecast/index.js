import * as TYPES from './types';
import * as HELPERS from './helpers';

export default (field = {}, value, options) => {
  if (HELPERS.shouldReturnUndefined(value)) return;
  if (HELPERS.shouldReturnAsIs(value)) return value;

  try {
    const processor = TYPES[field.type] || TYPES.common;
    const result = processor(field, value, options);

    return result;
  } catch (error) {
    console.error(error);

    return undefined;
  }
};
