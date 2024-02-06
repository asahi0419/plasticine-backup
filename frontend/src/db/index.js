import { filter, find } from 'lodash/collection';
import { isObject, isString } from 'lodash/lang';

class DB {
  constructor(store) {
    this.store = store;
  }

  get state() {
    return this.store.redux.state();
  }

  getModel(model) {
    return (isObject(model) && (model.alias || model.id))
      ? find(this.state.metadata.app['model'], { [model.alias ? 'alias' : 'id']: model.alias || model.id })
      : find(this.state.metadata.app['model'], { [isString(model) ? 'alias' : 'id']: model });
  }

  model(input) {
    const model = this.getModel(input) || { alias: input };
    const records = this.state.metadata.app[model.alias] || [];

    return {
      where: (attributes) => {
        return filter(records, attributes);
      },
    }
  }
}

import store from '../store';
export default new DB(store)
