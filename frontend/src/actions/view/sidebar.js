import { SYSTEM_SIDEBAR_UPDATED } from '../types';

export function updateSystemSidebar(options) {
  return (dispatch) => dispatch({ type: SYSTEM_SIDEBAR_UPDATED, payload: { ...options } });
}
