require('./favicon.ico');

import 'babel-polyfill';

import 'semantic-ui-css/components/reset.min.css';
import './styles/semantic-ui-site.overrided.css';
import 'semantic-ui-css/components/button.min.css';
import 'semantic-ui-css/components/divider.min.css';
import 'semantic-ui-css/components/header.min.css';
import 'semantic-ui-css/components/icon.min.css';
import 'semantic-ui-css/components/input.min.css';
import 'semantic-ui-css/components/label.min.css';
import 'semantic-ui-css/components/segment.min.css';
import 'semantic-ui-css/components/form.min.css';
import 'semantic-ui-css/components/grid.min.css';
import 'semantic-ui-css/components/menu.min.css';
import 'semantic-ui-css/components/modal.min.css';
import 'semantic-ui-css/components/dimmer.min.css';
import 'semantic-ui-css/components/sidebar.min.css';
import 'semantic-ui-css/components/accordion.min.css';
import 'semantic-ui-css/components/loader.min.css';
import 'semantic-ui-css/components/table.min.css';
import 'semantic-ui-css/components/checkbox.min.css';
import 'semantic-ui-css/components/dropdown.min.css';
import 'semantic-ui-css/components/transition.min.css';
import 'semantic-ui-css/components/progress.min.css';
import 'semantic-ui-css/components/message.min.css';
import 'semantic-ui-css/components/popup.min.css';

import 'slick-carousel/slick/slick.css';

import './styles/base.css';
import './styles/semantic-ui-overrides.css';
import './styles/mapbox.css';
import './styles/react-contextmenu-overrides.css';
import './styles/react-editor-js-overrides.css';
import './styles/react-input-number-overrides.css';
import './styles/react-slider-overrides.css';
import './styles/slick-slider.css';

import './styles/form.css';
import './styles/filter.css';
import './styles/shared-dropdown.css';

import './styles/data-template-field.css';
import './styles/data-visual-field.css';
import './styles/reference-field.css';
import './styles/reference-to-list-field.css';

import 'rc-color-picker/assets/index.css';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import 'tippy.js/dist/tippy.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import qs from 'qs'
import lodash from 'lodash'

import store from './store';
import routes from './routes';
import pHistory from './history';
import Sandbox from './sandbox';
import createI18nInstance from './i18n';
import { getCookie, removeCookie } from './helpers';
import { USER_AUTHORIZED, WS_CONNECT, APP_OPTIONS_UPDATED } from './actions/types';
import {
  isUserAuthorized,

  storeSession,
  removeSession,

  storeJWTToken,
  removeJWTToken,
  removeSessionJWTToken,

  storeStaticToken,
  removeStaticToken,
  removeSessionStaticToken,

  removeUser,
  removeSessionUser,
  getStore,
  getLocation,
} from './auth';

window.i18n = createI18nInstance('en');
window.store = store;
window.pHistory = pHistory;
window.lodash = lodash;
window.Sandbox = Sandbox;

// turn on embedded mode
const queryOptions = qs.parse(window.location.search.replace(/^\?/, ''));

if (queryOptions.session === 'true') {
  storeSession(queryOptions.session);
  removeUser();
  removeJWTToken();
  removeStaticToken();
} else {
  removeSession();
  removeSessionUser();
  removeSessionJWTToken();
  removeSessionStaticToken();
}

if (queryOptions.login) {
  getStore().set('successRedirect', getLocation());
}

if (queryOptions.embedded) {
  store.redux.instance.dispatch({
    type: APP_OPTIONS_UPDATED,
    payload: { embedded: true },
  });
}

if (queryOptions.token) {
  storeStaticToken(queryOptions.token);
} else {
  removeStaticToken();
}

if (getCookie('co2_jwt_token')) {
  storeJWTToken(getCookie('co2_jwt_token'));
  removeCookie('co2_jwt_token');
}

if (isUserAuthorized()) {
  store.redux.instance.dispatch({ type: USER_AUTHORIZED });
  store.redux.instance.dispatch({ type: WS_CONNECT });
}

const container = document.querySelector('#app');
const root = createRoot(container);
root.render(
  <Provider store={store.redux.instance}>
    <Router history={pHistory.provider} routes={routes} />
  </Provider>
);
