import PubSub from 'pubsub-js';

class Messenger {
  error({ header, content, list }) {
    PubSub.publish('messages', { type: 'negative', header, content, list });
  }

  info({ header, content }) {
    PubSub.publish('messages', { type: 'info', header, content });
  }
}

export default new Messenger();
