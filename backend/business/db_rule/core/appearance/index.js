import cache from '../../../../presentation/shared/cache/index.js';
import * as Error from '../../../error/index.js';

export const validateOptions = async (record, sandbox, mode) => {
  try {
    JSON.parse(record.options || '{}');
  } catch (error) {
    const message = sandbox.translate('static.field_error', { field: 'Options', error: error.message });
    throw new Error.RecordNotValidError(message);
  }
};

const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'appearances',
    params: { action, payload },
  });
}

export default {
  before_insert: [validateOptions],
  before_update: [validateOptions],
  after_insert:[reloadCache('insert')],
  after_update:[reloadCache('update')],
  after_delete: [reloadCache('delete')],
};
