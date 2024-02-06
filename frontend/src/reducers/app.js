import { merge } from 'lodash/object';
import { cloneDeep } from 'lodash/lang';

import * as Types from '../actions/types';

const INITIAL_STATE = {
  ready: false,
  user: null,
  readyComponents: [],
  authenticated: false,
  embedded: false,
  settings: {
    start_url: '/pages/login',
    theme: 'blue',
    build: {
      id: (process.env.NODE_ENV === 'test') ? null : __BUILD__,
      version: (process.env.NODE_ENV === 'test') ? null : __VERSION__,
      branch: (process.env.NODE_ENV === 'test') ? null : __BRANCH__,
      created_at: (process.env.NODE_ENV === 'test') ? null : __DATE__,
    },
  },
  error: '',
  scheduled_requests: {},
};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.APP_INITIALIZED:
      const { settings, translations, components } = action.payload;
      const newState = {
        ...state,
        components,
        translations,
        settings: { ...state.settings, ...settings },
        ready: !state.authenticated,
      };
      return newState;
    case Types.APP_USER_FULFILLED:
      return { ...state, ...merge(cloneDeep(state), action.payload), ready: true };
    case Types.APP_OPTIONS_UPDATED:
      return { ...state, ...merge(cloneDeep(state), action.payload) };
    case Types.APP_COMPONENT_READY:
      return { ...state, readyComponents: [ ...state.readyComponents, action.payload ] };
    case Types.APP_THEME_CHANGED:
      return { ...state, ...merge(cloneDeep(state), { settings: action.payload }) };
    case Types.USER_AUTHORIZED:
      return { ...state, authenticated: true, ready: false, user: null };
    case Types.USER_LOGGED_OUT:
      return INITIAL_STATE;
    case Types.ERROR:
      return { ...state, error: action.payload };
    case Types.SET_SCHEDULED_REQUEST:
      const newReq = { ...state.scheduled_requests, [action.payload.scheduled_request]: true };
      return { ...state, scheduled_requests: newReq };
    case Types.REMOVE_SCHEDULED_REQUEST:
      const removeReq = { ...state.scheduled_requests, [action.payload.scheduled_request]: null };
      return { ...state, scheduled_requests: removeReq };
    case Types.UPDATE_STORE:
      if (action.payload.store_type === 'user') {
        const new_user = { ...state.user, ...action.payload.data };
        return { ...state, user: new_user };
      }
  }

  return state;
};
