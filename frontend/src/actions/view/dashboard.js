import { CONTENT_CLOSED, CONTENT_CHANGED } from '../types';
import { openContent } from './helpers';

export function openDashboard(alias, params, loadingAction) {
  return openContent('dashboard', alias, params, loadingAction);
}

export function closeDashboard() {
  return (dispatch) => dispatch({ type: CONTENT_CLOSED });
}

export function changeDashboard(payload) {
  return (dispatch) => dispatch({ type: CONTENT_CHANGED, payload });
}
