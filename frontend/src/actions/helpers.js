import { first } from 'lodash/array';
import { isString } from 'lodash/lang';

import * as Auth from '../auth';
import Messenger from '../messenger';
import PlasticineApi from '../api';
import { ERROR } from './types';
import { processResponse } from './view/actions';

const ERRORS_WHICH_MUST_CLOSE_SESSION = [
  'AuthenticationError',
  'ExpiredSessionError',
  'StolenSessionError',
  'WrongUserCredentialsError',
  'TokenExpiredError',
  'ExpiredSystemError',
];

export const getErrorMessage = (data = {}) => {
  let error = first(data.response?.data?.errors);
  if (!error) error = { message: data.name, description: data.message };

  const result = { type: 'negative', header: error.message };

  if (error.description) {
    const list = isString(error.description) ? error.description.split('\n') : [];

    if (list.length > 1) {
      result.list = list;
    } else {
      result.content = error.description.message || error.description;
    }
  }

  return result;
};

export const processError = (data = {}, dispatch) => {
  if (data.response) {
    if (dispatch) {
      dispatch({ type: ERROR, payload: data });

      const { errors = [] } = data.response.data || {};
      const [ error = {} ] = errors;

      if (Auth.isUserAuthorized()) {
        if (ERRORS_WHICH_MUST_CLOSE_SESSION.includes(error.name)) {
          const location = Auth.getLocation();

          processResponse({
            action: 'logout',
            options: {
              redirect: '/pages/login',
            },
          }, dispatch);

          if (location !== '/') {
            Auth.getStore().set('successRedirect', location);
          }
        }
      }

      if (['RecordNotFoundError', 'ViewNotFoundError'].includes(error.name)) {
        const [ model ] = window.location.pathname.slice(1).split('/')

        PlasticineApi.loadView(model, '__first', { exec_by: { type: 'main_view' } }).then(({ data }) => {
          const { entities } = PlasticineApi.normalize(data)
          const [ view ] = Object.values(entities.view)

          processResponse({
            action: 'open_view',
            options: {
              model: model,
              view: view.alias,
              view_type: view.type
            },
          }, dispatch);
        });
      }
    }

    if (!data.silent) {
      Messenger.error(getErrorMessage(data));
    }

    return data.response;
  }

  console.error(data);
  return data;
};

export const fetchFilterTree = async (modelAlias, filter) => {
  try {
    const result = await PlasticineApi.processFilter(modelAlias, filter);

    return result;
  } catch (error) {
    processError(error);

    return {};
  }
};
