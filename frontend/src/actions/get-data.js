import PlasticineApi from '../api';
import normalize from '../api/normalizer';
import {
  UPDATE_STORE,
  SET_SCHEDULED_REQUEST,
  REMOVE_SCHEDULED_REQUEST,
  APP_METADATA_FULFILLED_REWRITE
} from './types';
import { processError } from './helpers';

export default (message, store) => {
  const storeState = store.getState();
  if (storeState.app.scheduled_requests[message.type]) return;

  switch(message.type) {
    case 'user_privileges':
      if (message.all_users) {
        sentRequest({ type: message.type }, store.dispatch);
        break;
      }
    case 'user_groups':
      const user = storeState.app.user.attributes;
      const new_data = message.user_ids.includes(user.id);
      if (new_data) sentRequest({ type: message.type }, store.dispatch);
      break;
    case 'user_permissions':
      sentRequest({ type: message.type }, store.dispatch);
      break;
    case 'metadata':
      sentRequest({ type: message.type }, store.dispatch);
      break;
    default:
      console.log(`Received update_store with unknown resource type: ${message.type}`);
  }
};

function sentRequest(params, dispatch) {
  dispatch({ type: SET_SCHEDULED_REQUEST, payload: { scheduled_request: params.type } });
  setTimeout(() => {
    switch(params.type) {
      case 'metadata':
        return PlasticineApi.loadModels()
          .then(({ data }) => dispatch({ type: APP_METADATA_FULFILLED_REWRITE, payload: normalize(data).entities }))
          .then(() => dispatch({ type: REMOVE_SCHEDULED_REQUEST, payload: { scheduled_request: params.type } }))
          .catch(error => processError(error, dispatch));
        break;
      case 'user_privileges':
      case 'user_groups':
      case 'user_permissions':
        return PlasticineApi.loadUser(params)
          .then((data) => dispatch({ type: UPDATE_STORE, payload: {store_type: 'user', data: data.data} }))
          .then(() => dispatch({ type: REMOVE_SCHEDULED_REQUEST, payload: { scheduled_request: params.type } }))
          .catch(error => processError(error, dispatch));
        break;
    }
  }, Math.floor(Math.random() * 60000));
}
