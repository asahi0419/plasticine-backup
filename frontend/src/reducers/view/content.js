import {
  LOCATION_CHANGED,
  CONTENT_CLOSED,
  CONTENT_PENDING,
  CONTENT_FULFILLED,
  CONTENT_REJECTED,
  FORM_RECORD_UPDATED,
  CONTENT_CHANGED,
  VIEW_COUNT_FULFILLED,
  RECORD_SIBLINGS_FULFILLED,
} from '../../actions/types';

const INITIAL_STATE = {
  ready: false,
  model: '',
  type: '',
  params: {},
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case LOCATION_CHANGED:
      return {
        ...state,
        ready: false,
      };
    case CONTENT_CLOSED:
      return { ...INITIAL_STATE };
    case CONTENT_PENDING:
      return {
        ...state,
        ready: false,
        model: action.openedModel,
        type: action.contentType,
        params: action.params,
      };
    case CONTENT_FULFILLED:
      return {
        ...state,
        ready: true,
        model: action.openedModel,
        type: action.contentType,
        params: Object.assign({}, state.params, action.params),
      };
    case CONTENT_REJECTED:
      return {
        ...state,
        ready: false,
        model: action.openedModel,
        type: action.contentType,
        error: action.error,
      };
    case FORM_RECORD_UPDATED:
      return {
        ...state,
        params: {
          ...state.params,
          record: { ...action.record },
        },
      };
    case CONTENT_CHANGED:
      return {
        ...state,
        params: {
          ...state.params,
          record: {
            ...state.params.record,
            ...action.payload
          },
        },
      };
    case VIEW_COUNT_FULFILLED:
      return {
        ...state,
        params: {
          ...state.params,
          viewOptions: {
            ...state.params.viewOptions,
            page: {
              ...state.params.viewOptions.page,
              totalSize: action.count,
            },
          },
        },
      };
    case RECORD_SIBLINGS_FULFILLED:
      return {
        ...state,
        params: {
          ...state.params,
          siblings: {
            prev_record_id: action.prev_record_id,
            next_record_id: action.next_record_id,
          },
        },
      };
  }

  return state;
}
