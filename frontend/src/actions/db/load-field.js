import { METADATA_FULFILLED } from '../types';

import * as LOADERS from './field';

export default (modelAlias, { field, recordId, value }) => async (dispatch, getState) => {
  const { payload, ...rest } = await LOADERS[field.type](dispatch, getState)(field, recordId, value);

  dispatch({ type: METADATA_FULFILLED, payload: payload.metadata, target: `${modelAlias}/field/${field.alias}` });

  return rest;
}
