import { find } from 'lodash/collection';
import { values } from 'lodash/object';

import history from '../../history';
import normalize from '../../api/normalizer';
import PlasticineApi from '../../api';
import loadPageVariables from './load-page-variables';
import { processError } from '../helpers';
import { APP_OPTIONS_UPDATED, APP_METADATA_FULFILLED } from '../types';

export const loadPage = async (state, pageAlias) => {
  const statePage = find(state.metadata.app.page, { alias: pageAlias });
  if (statePage) return { page: statePage };

  const { data } = await PlasticineApi.loadPages({ filter: `alias = '${pageAlias}'` });
  const { entities } = await normalize(data);
  const { user } = data;
  const [ page ] = values(entities.page);

  return { page, user, entities };
}

export default (pageAlias, params = {}) => async (dispatch, getState) => {
  try {
    const { page, user, entities = {} } = await loadPage(getState(), pageAlias);
    if (!page && localStorage.key(0) === 'otp_token') localStorage.removeItem('otp_token');
    
    if (!page) return { error: i18n.t('page_not_found_error', { defaultValue: 'Page not found' }) };

    const variables = await loadPageVariables(page, params) || {};
    const alias = (pageAlias === 'privilege_manager') ? 'privileges' : pageAlias;
    const actions = values(entities.action) || [];

    if (!params.element && history.isLeft('page', { pageAlias: alias })) return;
    if (user) dispatch({ type: APP_OPTIONS_UPDATED, payload: { user } });
    if (entities) dispatch({ type: APP_METADATA_FULFILLED, payload: entities });

    return { page, actions, variables };
  } catch (error) {
    processError(error)
  }
};
