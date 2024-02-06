import { each } from 'lodash-es';

import NAMESPACES from './namespaces/index.js';

class Cache {
  constructor(namespaces) {
    this.namespaces = namespaces;
  }

  init() {
    return perform(this.namespaces, 'init');
  }

  start(context) {
    return perform(this.namespaces, 'start', context);
  }

  listen(context) {
    return perform(this.namespaces, 'listen', context);
  }

  stop() {
    return perform(this.namespaces, 'stop');
  }
}

const perform = (namespaces, command, context) => {
  let promise = Promise.resolve();

  each(namespaces, (n) => {
    promise = promise.then(() => n[command](context));
  });

  return promise;
};

export default new Cache(NAMESPACES);
