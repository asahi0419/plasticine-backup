import lodash from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { parseOptions } from '../../helpers/index.js';
import cache from '../../../presentation/shared/cache/index.js';

export const reloadCache = (action) => (record) => {
  const payload = record;

  cache.namespaces.core.messageBus.publish('service:reload_cache', {
    target: 'actions',
    params: { action, payload },
  });
}

const validateFormFieldOptions = async (action, sandbox) => {
  const { name, model, options } = action;
  const { field_related: alias } = parseOptions(options);

  if (alias) {
    const field = db.getField({ model, alias });
    if (!field) throw new Error(sandbox.translate('static.wrong_field_related_option_for_action', { field: alias, action: name }));
  }
}

const processAttributes = async (action, sandbox) => {
  if (action.model) {
    if (lodash.isString(action.model)) {
      const model = db.getModel(action.model, { silent: true }) || {};

      action.model = model.id;
    }
  }
};

const validateOptions = async (action, sandbox) => {
  if (action.type === 'form_field') {
    await validateFormFieldOptions(action, sandbox);
  }
};

export default {
  before_insert: [processAttributes, validateOptions],
  before_update: [validateOptions],
  after_insert:[reloadCache('insert')],
  after_update:[reloadCache('update')],
  after_delete: [reloadCache('delete')],
};
