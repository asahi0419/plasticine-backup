import PlasticineApi from '../../api';
import normalize from '../../api/normalizer';
import { APP_METADATA_FULFILLED } from '../types';
import { processError } from '../helpers';

export default () => (dispatch) => {
  return PlasticineApi.loadPages()
    .then(({ data }) => dispatch({ type: APP_METADATA_FULFILLED, payload: normalize(data).entities }))
    .catch(error => processError(error, dispatch));
};
