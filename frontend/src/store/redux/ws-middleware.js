import normalize from '../../api/normalizer';
import {
  WS_CONNECT,
  WS_DISCONNECT,
  WS_CONNECTED,
  WS_DISCONNECTED,
  WS_MESSAGE_SENT,
  FORM_RECORD_UPDATED,
  RECORDS_FULFILLED,
  UPDATE_ACCOUNT
} from '../../actions/types';
import { processResponse } from '../../actions/view/actions';
import { getJWTToken } from '../../auth';
import getData from '../../actions/get-data';

const socketMiddleware = (function(){
  let socket = null;
  let reconnecting = false;

  const onOpen = (store) => (event) => store.dispatch({ type: WS_CONNECTED, event });
  const onClose = (store) => (event) => store.dispatch({ type: WS_DISCONNECTED, event });

  const onMessage = (store) => (event) => {
    const message = JSON.parse(event.data);

    switch(message.type) {
      case 'message':
        alert(message.payload);
        break;
      case 'records':
        const payload = normalize(message.payload);
        store.dispatch({ type: RECORDS_FULFILLED, payload });

        // update internal record of form's content
        const content = store.getState().view.content;
        if (content.type === 'form') {
          const record = (payload.entities[content.model] || {})[content.params.recordId];
          if (record) store.dispatch({ type: FORM_RECORD_UPDATED, record });
        }

        break;
      case 'geo_data':
        console.log('Received GEO_DATA', message.payload);
        break;
      case 'command':
        processResponse(message.payload, store.dispatch);
        break;
      case 'update_store':
        getData(message.payload, store);
        break;
      default:
      // console.log(`Received unknown message type: ${message.type}`);
    }
  };

  return store => next => action => {
    switch(action.type) {
      case WS_CONNECT:
        if (socket !== null) socket.close();
        const protocol = location.protocol === 'http:' ? 'ws' : 'wss';

        const token = getJWTToken();
        if (!token) { socket = null; break; }

        socket = new WebSocket(`${protocol}://${location.host}/ws?x=${token}`);
        socket.onopen = onOpen(store);
        socket.onmessage = onMessage(store);
        socket.onclose = onClose(store);

        break;

      case WS_DISCONNECTED:
        if (socket !== null) socket.close();
        socket = null;

        if (!reconnecting) {
          reconnecting = true;
          store.dispatch({ type: WS_CONNECT });
        } else {
          reconnecting = false;
        }

        break;

      default:
        return next(action);
    }
  };
})();

export default socketMiddleware;
