import { find } from 'lodash/collection';
import { merge } from 'lodash/object';

import { parseOptions } from '../../../../../helpers';
import { loadFields, loadTemplates } from './helpers';

export default (dispatch, getState) => async (field, recordId, value) => {
  const state = getState();

  const options = parseOptions(field.options);
  const modelIdOrAlias = options.ref_model || field.model;
  const stateModel = find(state.metadata.app.model, { id: modelIdOrAlias }) ||
    find(state.metadata.app.model, { alias: modelIdOrAlias });
  const model = { model: { [stateModel.id]: stateModel } };
  const fields = await loadFields(modelIdOrAlias);
  const templates = await loadTemplates(modelIdOrAlias);

  const metadata = merge(model, fields, templates);

  return { payload: { metadata } };
};
