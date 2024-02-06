export default class Base {
  constructor(messageBus) {
    this.messageBus = messageBus;
  }

  get client() {
    return this.messageBus.nrp.getRedisClient();
  }

  init() {

  }

  start(context) {
    this.listen(context);
  }

  stop() {
    this.messageBus.end();
  }

  listen(context = {}) {
    this.messageBus.on('service:reload_cache', (payload) => {

    });
  }
}
