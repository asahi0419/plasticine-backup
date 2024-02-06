import qs from 'qs';
import axios from 'axios';
import PubSub from 'pubsub-js';
import Promise from 'bluebird';
import { find } from 'lodash/collection';
import { values, omit } from 'lodash/object';
import { isEmpty, isString, isNil } from 'lodash/lang';

import store from '../../store';
import history from '../../history';
import normalize from '../../api/normalizer';
import LongAction from '../../components/notification-panel/long-action';
import * as Auth from '../../auth';
import * as RawPlasticineApi from '../../api';
import { processError } from '../helpers';
import { makeUniqueID, downloadAttachment } from '../../helpers';

import {
  WS_CONNECT,
  USER_AUTHORIZED,
  USER_LOGGED_OUT,
  ACTION_PENDING,
  ACTION_FULFILLED,
  ACTION_REJECTED,
  ACTION_CANCELED,
  ACTION_RESPOND_WITH_DATA,
  ACTION_RESPOND_WITH_ERROR,
} from '../types';

const actionHandlers = {
  go_back: Promise.promisify(goBack),
  open_view: Promise.promisify(openView),
  open_self_view: Promise.promisify(openSelfView),
  open_form: openForm,
  open_page: Promise.promisify(openPage),
  open_url: Promise.promisify(openURL),
  show_message: Promise.promisify(showMessage),
  auth_user: Promise.promisify(authUser),
  logout: Promise.promisify(logout),
  download_file: Promise.promisify(downloadFile),
};

export function handleAction(model, action, params = {}) {
  if (action.group) return;

  const { sandbox, callbacks = {}, ...options } = params;

  const source = axios.CancelToken.source();
  const payload = { id: makeUniqueID(), model, action, callbacks, source };

  // cleanup service keys from record
  if (options.record) {
    options.record = omit(options.record, ['__metadata']);
  }

  return async (dispatch, getState) => {
    const pendingAction = find(getState().view.action, { ready: false });
    if (pendingAction) {
      if (callbacks.success) callbacks.success();
      if (!options.parallel) {
        return PubSub.publish(
          'messages',
          i18n.t('action_still_in_progress', { action: pendingAction.action.name }),
        );
      }
    }

    dispatch({ type: ACTION_PENDING, payload });

    PubSub.publish('messages', {
      id: payload.id,
      position: 'center',
      component: LongAction,
      onClose: () => dispatch({ type: ACTION_CANCELED }),
    });

    try {
      const response = await RawPlasticineApi.executeAction(
        model.alias,
        action.alias,
        options,
        { cancelToken: options.parallel ? null : source.token },
      );
      if (!getState().view.action[payload.id]) return;

      dispatch({ type: ACTION_RESPOND_WITH_DATA, payload: { ...payload, ...response } });

      const proceed = await processResponseScript(action, response, dispatch, sandbox);
      if (proceed) return processResponse(response.data, dispatch, callbacks, params);
    } catch (error) {
      if (!getState().view.action[payload.id]) return;

      dispatch({ type: ACTION_RESPOND_WITH_ERROR, payload: { ...payload, error } });
      dispatch({ type: ACTION_REJECTED });

      return processError(error, dispatch);
    }
  };
}

export function processResponse(data, dispatch, callbacks, params) {
  const actionHandler = actionHandlers[data.action];
  if (actionHandler) return actionHandler(data, dispatch, callbacks, params);

  dispatch({ type: ACTION_FULFILLED });
  return data;
}

export async function processResponseScript(action, response, dispatch, sandbox) {
  if (isNil(action.response_script)) return true;

  if (sandbox) {
    sandbox.context.response = response;
  } else {
    const Sandbox = require('../../sandbox').default;
    sandbox = new Sandbox({ user: store.redux.state('app.user'), response });
  }

  const result = await sandbox.executeScript(action.response_script, { modelId: action.model });
  if (result !== false) return true;

  dispatch({ type: ACTION_FULFILLED });
  return false;
}

function goBack(data, dispatch, callbacks, params = {}) {
  const { exec_by } = params;
  const { options = {} } = data;

  if (options.message) {
    PubSub.publish('messages', options.message);
  }

  dispatch({ type: ACTION_FULFILLED });

  if (exec_by.popup) return;
  history.goBack(options);
}

function openView(data, dispatch) {
  const { model: modelAlias, view: viewAlias, view_type: viewType, options = {}, parent } = data.options;

  if (options.message) {
    PubSub.publish('messages', options.message);
    delete options.message;
  }

  if (options.popup) {
    dispatch({ type: ACTION_FULFILLED });

    PubSub.publish('modal', { modelAlias, viewAlias, target: 'view', options, parent });
    return;
  }

  if (isEmpty(options)) {
    history.push(`/${modelAlias}/view/${viewType}/${viewAlias}#${makeUniqueID()}`);
  } else {
    history.push({
      pathname: `/${modelAlias}/view/${viewType}/${viewAlias}`,
      search: `?${qs.stringify(options)}`,
      hash: `#${makeUniqueID()}`,
    });
  }
}

// TODO: Maybe move to openView in future. For now this one сonsidered as temp solution.
function openSelfView(data, dispatch, callbacks) {
  const { options = {} } = data.options;

  if (options.message) {
    PubSub.publish('messages', options.message);
    delete options.message;
  }

  if (callbacks && callbacks.openView) {
    callbacks.openView(options);
  } else {
    const { pathname, search } = history.getCurrEntry();
    history.push({ pathname, search, hash: `#${makeUniqueID()}` });
  }
}

function openForm(data, dispatch, callbacks, params = {}) {
  const { model: modelAlias, options = {}, parent } = data.options;
  const { exec_by = {} } = params;
  const record = values(normalize(data.options.record).entities[modelAlias])[0];

  if (options.message) {
    PubSub.publish('messages', options.message);
    delete options.message;
  }

  if (exec_by.popup) {
    dispatch({ type: ACTION_FULFILLED });

    return;
  }

  if (options.popup) {
    dispatch({ type: ACTION_FULFILLED });

    PubSub.publish('modal', { modelAlias, recordId: record.id, target: 'form', options, parent });
    return;
  }

  if (options.associate) {
    record.__metadata.associate = options.associate;
  }

  const isNewRecord = !record.__metadata.inserted;
  const formUrl = `/${modelAlias}/form/${isNewRecord ? 'new/' : ''}${record.id}`;

  // AAM: https://redmine.nasctech.com/issues/44517
  //if ((isNewRecord && location.pathname !== formUrl) || !isNewRecord) {
  const pushOptions = { pathname: formUrl, hash: `#${makeUniqueID()}` };

  // proxy params in case of new action (associate param)
  if (Object.keys(options).length) {
    pushOptions.search = '?' + qs.stringify(options);
  }

  history.push(pushOptions);
  //}
}

function openPage(data) {
  const { page: pageAlias, options = {} } = data.options;
  const entry = { pathname: `/pages/${pageAlias}`, hash: `#${makeUniqueID()}` };
  const search = qs.stringify(omit(options, ['message']));

  if (!isEmpty(search)) entry.search = `?${search}`;
  if (options.message) PubSub.publish('messages', options.message);

  // TODO: implement cleverer solution
  if (pageAlias === 'privilege_manager') {
    return history.push(`/${options.model.alias}/privileges`);
  }

  history.push(entry);
}

function openURL(data = {}, dispatch) {
  if (data.options?.options?.message) alert(data.options.options.message);

  dispatch({ type: ACTION_FULFILLED });
  location.href = data.options.url;
}

function showMessage(data, dispatch) {
  PubSub.publish('messages', data.options.message);
  dispatch({ type: ACTION_FULFILLED });
}

export function authUser(data = {}, dispatch) {
  const { type, token, redirect = true } = data.options || {};

  if (type === 'otp') {
    Auth.removeJWTToken();
    Auth.storeOTPToken(token);
  }

  if (type === 'auth') {
    Auth.removeOTPToken();
    Auth.storeJWTToken(token);
  }

  Auth.removeStaticToken();

  dispatch({ type: USER_AUTHORIZED });
  dispatch({ type: WS_CONNECT });
  dispatch({ type: ACTION_FULFILLED });

  const path = store.redux.state('app.settings.home_page') || '/'

  if (redirect) {
    if (isString(redirect)) {
      location.href = redirect;
      return;
    }

    const successRedirect = Auth.getStore().get('successRedirect');

    if (successRedirect) {
      history.push(successRedirect);
      Auth.getStore().remove('successRedirect');
    } else {
      history.push(path);
    }
  } else {
    history.push(path);
  }
}

function logout(data = {}, dispatch) {
  dispatch({ type: USER_LOGGED_OUT });
  dispatch({ type: ACTION_FULFILLED });

  localStorage.clear();
  sessionStorage.clear();

  const { redirect = '/' } = data.options || {};
  if (window.location.pathname !== redirect) {
    history.push(redirect);
  }
}

async function downloadFile(data = {}, dispatch) {
  const { attachment } = data.options || {};
  const result = await downloadAttachment(attachment);
  dispatch({ type: ACTION_FULFILLED });
  return result;
}
