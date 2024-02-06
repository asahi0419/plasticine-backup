import NRP from 'node-redis-pubsub';

export default class MessageBus {
  constructor(options = {}) {
    this.nrp = new NRP(options)
  }

  on(queueName, cb) {
    this.nrp.on(queueName, cb);
  }

  publish(queueName, message) {
    this.nrp.emit(queueName, message);
  }

  end() {
    this.nrp.end();
  }
}
