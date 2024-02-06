import { RECORD_SIBLINGS_FULFILLED, CONTENT_CLOSED, CONTENT_CHANGED } from '../types';
import { openContent } from './helpers';
import PlasticineApi from '../../api';

function loadRecordSiblings(modelAlias, recordId, params) {
  return (loadingResult, dispatch) => {
    return PlasticineApi.getRecordSiblings(modelAlias, recordId, params)
      .then(({ data: { prev_record_id, next_record_id }}) =>
        dispatch({ type: RECORD_SIBLINGS_FULFILLED, prev_record_id, next_record_id })
      );
  }
}

export function openForm(modelAlias, recordId, loadingAction, params) {
  const additionalActions = [loadRecordSiblings(modelAlias, recordId, params)];
  return openContent('form', modelAlias, { recordId, params }, loadingAction, additionalActions);
}

export function closeForm() {
  return (dispatch) => dispatch({ type: CONTENT_CLOSED });
}

export function changeForm(payload) {
  return (dispatch) => dispatch({ type: CONTENT_CHANGED, payload });
}
