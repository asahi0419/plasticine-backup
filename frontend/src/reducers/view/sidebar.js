import { SYSTEM_SIDEBAR_UPDATED } from '../../actions/types';

const INITIAL_STATE = { system: { collapsedItems: [], favoriteItems: [] }, user: {} };

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case SYSTEM_SIDEBAR_UPDATED:
      return { ...state, system: { ...state.system, ...action.payload } };
  }

  return state;
}
