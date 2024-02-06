import normalize from '../../api/normalizer';
import PlasticineApi from '../../api';
import * as HELPERS from '../helpers';
import * as ACTION_TYPES from '../types';

export default () => async (dispatch) => {
  try {
    const result = await PlasticineApi.loadDashboards();
    const payload = normalize(result.data).entities;

    dispatch({ type: ACTION_TYPES.APP_METADATA_FULFILLED, payload });

    return payload;
  } catch (error) {
    HELPERS.processError(error, dispatch);
  }
};
