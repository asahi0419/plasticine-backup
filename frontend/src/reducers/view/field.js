import {
  CONTENT_CLOSED,
  FIELD_PENDING,
  FIELD_FULFILLED,
  FIELD_CLOSED,
} from '../../actions/types';

const INITIAL_STATE = {};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CONTENT_CLOSED:
      return { ...INITIAL_STATE };
    case FIELD_PENDING:
      return {
        ...state,
        [action.field]: {
          ready: false,
          model: action.model,
          record: action.record,
          params: action.params,
        },
      };
    case FIELD_FULFILLED:
      return {
        ...state,
        [action.field]: {
          ready: true,
          model: action.model,
          record: action.record,
          params: action.params,
        },
      };
    case FIELD_CLOSED:
      return {
        ...state,
        [action.field]: {},
      };
  }

  return state;
}
