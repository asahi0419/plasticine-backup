import PlasticineApi from '../api';
import { getPage } from '../helpers';
import { APP_THEME_CHANGED } from './types';

export default (theme) => (dispatch) => {
  const page = getPage('layout');
  const options = { theme };

  dispatch({ type: APP_THEME_CHANGED, payload: options });
  return PlasticineApi.updateUserSettings('page', page.id, { type: 'layout', options });
};
