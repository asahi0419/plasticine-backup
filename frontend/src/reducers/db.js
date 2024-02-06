import lodash from 'lodash';

import * as Types from '../actions/types';

const INITIAL_STATE = {};

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.RECORDS_FULFILLED:
      return lodash.mergeWith({}, state, action.payload, customizer);
    case Types.USER_LOGGED_OUT:
      return INITIAL_STATE;
  }

  return state;
}

function customizer(obj, src) {
  if (lodash.isArray(obj)) {
    return src;
  }
}