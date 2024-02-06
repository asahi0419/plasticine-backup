import { merge } from 'lodash/object';
import { cloneDeep } from 'lodash/lang';

import * as Types from '../actions/types';

const INITIAL_STATE = { relatedViews: [] };

export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case Types.EXPORT_FORM_RELATED_VIEW_PARAMS:
      if (!action.payload) return { ...state, relatedViews: [] };
      let isNewView = true, newRelatedViews = [];
      for (let i=0; i < state.relatedViews.length; i++) {
        if (state.relatedViews[i].modelAlias === action.payload.modelAlias && state.relatedViews[i].viewAlias === action.payload.viewAlias) {
          isNewView = false;
          newRelatedViews.push(action.payload);
        } else {
          newRelatedViews.push(state.relatedViews[i]);
        }
      }
      if (isNewView) { newRelatedViews.push(action.payload);}

      return { ...state, relatedViews: newRelatedViews.slice(-5) };
  }

  return state;
};
