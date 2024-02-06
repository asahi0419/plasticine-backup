import cache from '../../../../../presentation/shared/cache/index.js';
import { mbQueueName } from './helpers.js';

export default class WSSender {
  constructor(channel) {
    this.channel = channel;
  }

  status() {
    return this;
  }

  json(payload) {
    cache.namespaces.core.messageBus.publish(
      mbQueueName(this.channel),
      { type: 'data', payload, channel_name: this.channel }
    );
  }
}
