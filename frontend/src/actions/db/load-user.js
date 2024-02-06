import { pick } from 'lodash/object';

import normalize from '../../api/normalizer';
import PlasticineApi from '../../api';
import createI18nInstance from '../../i18n';
import { storeUser } from '../../auth';
import { processError } from '../helpers';
import { APP_USER_FULFILLED } from '../types';

export default () => async (dispatch, getState) => {
  const state = getState();

  if (!state.app.authenticated) return;
  if (state.app.user) return;

  try {
    const { data: user } = await PlasticineApi.loadUser();
    window.i18n = createI18nInstance(user.language.alias, state.app.translations);
    storeUser(pick(user, ['session']));
    dispatch({ type: APP_USER_FULFILLED, payload: { user } });
  } catch (error) {
    processError({ ...error, silent: true }, dispatch);
  }
};
