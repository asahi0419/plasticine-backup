import axios from 'axios';
import PubSub from 'pubsub-js';
import { find } from 'lodash/collection';

import PlasticineApi from '../../api';
import LongAction from '../../components/notification-panel/long-action';
import { openContent } from './helpers';
import { processError } from '../helpers';
import { downloadView, makeUniqueID } from '../../helpers';

import {
  VIEW_COUNT_FULFILLED,
  CONTENT_CLOSED,
  ACTION_PENDING,
  ACTION_REJECTED,
  ACTION_CANCELED,
  ACTION_FULFILLED,
  ACTION_RESPOND_WITH_DATA,
  ACTION_RESPOND_WITH_ERROR,
} from '../types';

function loadViewCount(modelAlias) {
  return (loadingResult = {}, dispatch) => {
    const { filter, loadCount } = loadingResult.viewOptions || {};
    if (!loadCount) return;

    const params = {};
    if (filter) params.filter = filter;

    return PlasticineApi.loadViewCount(modelAlias, params)
      .then(({ data: { count }}) => dispatch({ type: VIEW_COUNT_FULFILLED, count }));
  }
}

export function openView(modelAlias, viewAlias, viewOptions, loadingAction) {
  const additionalActions = [
    loadViewCount(modelAlias, viewOptions.filter)
  ];

  return openContent(
    'view',
    modelAlias,
    { viewAlias, viewOptions },
    loadingAction,
    additionalActions,
  );
}

export function closeView() {
  return (dispatch) => dispatch({ type: CONTENT_CLOSED });
}

export function exportView(modelAlias, format, params) {
  const CancelToken = axios.CancelToken;
  const source = CancelToken.source();

  const action = { alias: 'export_view', name: 'Eport view', format };
  const payload = { id: makeUniqueID(), action, source };

  return async (dispatch, getState) => {
    const pendingAction = find(getState().view.action, { ready: false });
    if (pendingAction) return PubSub.publish('messages', i18n.t('action_still_in_progress', { defaultValue: "The action '{{action}}' is still in progress ...", action: pendingAction.action.name }));

    dispatch({ type: ACTION_PENDING, payload });

    PubSub.publish('messages', {
      id: payload.id,
      position: 'center',
      component: LongAction,
      onClose: () => dispatch({ type: ACTION_CANCELED }),
    });

    return downloadView(modelAlias, format, params, { cancelToken: source.token })
      .then((data) => {
        if (!getState().view.action[payload.id]) return;
        dispatch({ type: ACTION_RESPOND_WITH_DATA, payload: { ...payload, data } });
        dispatch({ type: ACTION_FULFILLED });
      })
      .catch((error) => {
        if (!getState().view.action[payload.id]) return;
        dispatch({ type: ACTION_RESPOND_WITH_ERROR, payload: { ...payload, error } });
        dispatch({ type: ACTION_REJECTED });
        return processError(error, dispatch);
      });
  }
}
