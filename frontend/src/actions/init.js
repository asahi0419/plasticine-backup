import Messenger from '../messenger';
import normalize from '../api/normalizer';
import PlasticineApi from '../api';
import createI18nInstance from '../i18n';
import { getSession } from '../auth';
import { processError } from './helpers';
import { authUser } from './view/actions';
import { APP_INITIALIZED, APP_METADATA_FULFILLED } from './types';

export default () => async (dispatch, getState) => {
  const state = getState();
  if (state.app.ready) return;

  try {
    const result = await PlasticineApi.init();

    const session = getSession();
    const token = result.headers['jwt-token'];
    if (session && token) authUser({ options: { token, redirect: false } }, dispatch);

    const { errors = [], translations, settings, pages = [], components = [] } = result.data;
    if (errors.length) Messenger.error({ header: i18n.t('initialization_error', { defaultValue: 'Initialization error' }), list: errors });

    dispatch({ type: APP_METADATA_FULFILLED, payload: normalize({ data: pages }).entities });
    dispatch({ type: APP_INITIALIZED, payload: { settings, components, translations, sliceComponents: ['pages'] }});
    window.i18n = createI18nInstance('en', translations);
    window.APP_NAME = settings.project_name;
  } catch (error) {
    processError(error, dispatch)
  }
};
