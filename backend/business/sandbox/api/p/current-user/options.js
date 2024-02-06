import { isObject } from 'lodash-es';

import { parseOptions } from '../../../../helpers/index.js';

export class OptionsProxy {
  constructor() {
    this.options = {};
  }

  getOptions() {
    return JSON.stringify(this.options);
  }

  setOptions(options) {
    this.options = isObject(options) ? options : parseOptions(options);
    return this;
  }

  getOption(key) {
    return this.options[key];
  }

  setOption(key, value) {
    this.options[key] = value;
    return this;
  }
}

export default new OptionsProxy();
