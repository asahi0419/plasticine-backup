import db from '../../../../../data-layer/orm/index.js';
import cache from '../../../../../presentation/shared/cache/index.js';
import Sandbox from '../../../../sandbox/index.js';
import WSSender from './sender.js';
import serializer from '../../../../record/serializer/json.js';
import { mbQueueName } from './helpers.js';
import { WebSocketNotFoundError } from '../../../../error/index.js';

export default class WSProxy {
  constructor(user) {
    this.user = user;
  }

  async send(webSocketAlias, data) {
    const ws = await db.model('web_socket').where({ active: true, alias: webSocketAlias }).getOne();
    if (!ws) throw new WebSocketNotFoundError();

    const sandbox = await Sandbox.create({
      request: { params: { data }, query: {}, body: {}},
      response: new WSSender(webSocketAlias),
      user: this.user,
    });

    if (ws.sender_script) {
      await sandbox.executeScript(ws.sender_script, `web_socket/${ws.id}/sender_script`);
    }
  }

  sendMessage(message) {
    const payload = { type: 'message', payload: message };
    cache.namespaces.core.messageBus.publish(mbQueueName(), payload);
  }

  sendRecords(records) {
    const payload = { type: 'records', payload: { data: serializer(records) } };
    cache.namespaces.core.messageBus.publish(mbQueueName(), payload);
  }

  sendGeoData(geoJson) {
    const payload = { type: 'geo_data', payload: geoJson };
    cache.namespaces.core.messageBus.publish(mbQueueName(), payload);
  }

  sendCommand(command) {
    const payload = { type: 'command', payload: command };
    cache.namespaces.core.messageBus.publish(mbQueueName(), payload);
  }

  sendUpdateStore(message) {
    const payload = { type: 'update_store', payload: message };
    cache.namespaces.core.messageBus.publish(mbQueueName(), payload);
  }
}
