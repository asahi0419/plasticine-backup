import { merge } from 'lodash/object';
import { find } from 'lodash/collection';

import { FIELD_PENDING, FIELD_FULFILLED, FIELD_CLOSED } from '../types';
import { processError } from '../helpers';

export function openField(modelAlias, params, loadingAction) {
  return async (dispatch) => {
    const dispatchParams = {
      model: modelAlias,
      field: params.field.id,
      record: params.recordId,
      value: params.value,
      params: {},
    };

    dispatch(merge({}, dispatchParams, { type: FIELD_PENDING }));

    try {
      const result = await loadingAction(modelAlias, params);
      dispatch(merge(dispatchParams, { type: FIELD_FULFILLED, params: { ...result }}));
    } catch (error) {
      error.response && error.response.status === 404 && history.goBack();
      processError(error, dispatch);
    }
  };
}

export function closeField(field) {
  return (dispatch) => dispatch({ type: FIELD_CLOSED, field });
}
