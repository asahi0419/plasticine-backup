import { merge } from 'lodash/object';
import { cloneDeep } from 'lodash/lang';

import * as Types from '../actions/types';

const INITIAL_STATE = { app: {} };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.USER_AUTHORIZED:
    case Types.USER_LOGGED_OUT:
      return INITIAL_STATE;
    case Types.APP_METADATA_FULFILLED:
      return { ...state, app: merge(cloneDeep(state.app), action.payload) };
    case Types.APP_METADATA_FULFILLED_REWRITE:
      return { ...state, app: { ...cloneDeep(state.app), ...action.payload } };
    case Types.METADATA_FULFILLED:
      return { ...state, [action.target]: action.payload };
  }

  return state;
};
