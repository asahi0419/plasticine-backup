import Promise from 'bluebird';
import { browserHistory } from 'react-router';
import { merge } from 'lodash/object';

import { processError } from '../helpers';
import history from '../../history';
import { CONTENT_PENDING, CONTENT_FULFILLED } from '../types';

export function openContent(type, modelAlias, params, loadingAction, additionalActions = []) {
  return async (dispatch) => {
    const dispatchParams = {
      contentType: type,
      openedModel: modelAlias,
      params: params
    };

    dispatch(merge({}, dispatchParams, { type: CONTENT_PENDING }));

    try {
      const result = await loadingAction(modelAlias, params);
      if (!result) return;

      dispatch(merge(dispatchParams, { type: CONTENT_FULFILLED, params: { ...result }}));
      await Promise.map(additionalActions, (action) => action(result, dispatch));
    } catch (error) {
      history.addError({ ...params, modelAlias, type }, error);
      error.response && error.response.status === 404 && history.goBack();
      processError(error, dispatch);
    }
  };
}
