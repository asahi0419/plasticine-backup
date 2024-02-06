import PubSub from 'pubsub-js';
import { each } from 'lodash/collection';

import * as Types from '../../actions/types';

const INITIAL_STATE = {};
const CALLBACKS_STATE = {}

const getResponse = (payload, options = {}) => {
  return lodash.pick(payload, options.error
    ? ['error']
    : ['config', 'data', 'headers', 'status', 'statusText']);
}

const processPayload = (p = {}) => {
  const callbacks = CALLBACKS_STATE[p.id];

  if (callbacks) {
    if (callbacks.success) callbacks.success(getResponse(p));
    if (callbacks.error) callbacks.error(getResponse(p, { error: true }));
    delete CALLBACKS_STATE[p.id];
  }

  if (p.source) {
    p.source.cancel();
    delete p.source.token.reason;
  }

  PubSub.publish('messages-remove', { id: p.id });
};

export default function (state = INITIAL_STATE, action = {}) {
  const { callbacks = {}, ...payload } = action.payload || {};

  switch (action.type) {
    case Types.ACTION_PENDING:
      CALLBACKS_STATE[payload.id] = callbacks;

      return { ...state, [payload.id]: { ...payload, ready: false } };
    case Types.ACTION_RESPOND_WITH_DATA:
      return { ...state, [payload.id]: { ...state[payload.id], ...getResponse(payload) } };
    case Types.ACTION_RESPOND_WITH_ERROR:
      return { ...state, [payload.id]: { ...state[payload.id], ...getResponse(payload, { error: true }) } };
    case Types.ACTION_FULFILLED:
    case Types.ACTION_REJECTED:
    case Types.ACTION_CANCELED:
    case Types.APP_METADATA_FULFILLED:
    case Types.METADATA_FULFILLED:
      each(state, (p) => processPayload(p));

      return INITIAL_STATE;
    default:
      return state;
  }
}
