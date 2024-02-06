import { CONTENT_CLOSED } from '../types';
import { openContent } from './helpers';

export function openPage(pageAlias, params, loadingAction) {
  return openContent('page', pageAlias, params, loadingAction);
}

export function closePage() {
  return (dispatch) => dispatch({ type: CONTENT_CLOSED });
}
