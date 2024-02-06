import * as Error from '../../error/index.js';

export const validateOptions = async (record, sandbox, mode) => {
  try {
    JSON.parse(record.properties || '{}');
  } catch (error) {
    const message = sandbox.translate('static.field_error', { field: 'Properties', error: error.message });
    throw new Error.RecordNotValidError(message);
  }
};

export default {
  before_insert: [validateOptions],
  before_update: [validateOptions],
};
