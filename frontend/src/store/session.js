import { isObject, isEmpty } from 'lodash/lang';
import { parseOptions } from '../helpers';

class Store {
  set(key, value) {
    if (isObject(value)) value = JSON.stringify(value);
    sessionStorage.setItem(key, value);
  }

  get(key) {
    let value = sessionStorage.getItem(key);
    if (!isEmpty(parseOptions(value))) return parseOptions(value);
    return value;
  }

  remove(key) {
    sessionStorage.removeItem(key);
  }
}

export default new Store()
