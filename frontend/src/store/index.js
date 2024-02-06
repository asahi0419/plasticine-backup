import { each } from 'lodash/collection';
import { get } from 'lodash/object';

import redux from './redux';
import blob from './blob';
import local from './local';
import session from './session';

class StoreType {
  static create(context = {}) {
    if (!context.type) return console.error('Store: type is required');
    if (!context.instance) return console.error('Store: instance is required');

    return new StoreType(context);
  }

  constructor(context) {
    this.type = context.type;
    this.instance = context.instance;
  }

  state(path) {
    if (this.type === 'redux') {
      const state = this.instance.getState();

      return path ? get(state, path) : state;
    }
  }
}

class Store {
  static create(context) {
    return new Store(context);
  }

  constructor(context = {}) {
    each(context, (instance, type) => {
      this[type] = StoreType.create({ type, instance });
    });
  }
}

export default Store.create({
  blob,
  local,
  redux,
  session,
});
