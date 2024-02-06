import store from '../store';

import StandardExecutor from './executors/standard';
import PageScriptExecutor from './executors/page-script';

const EXECUTORS = {
  default: StandardExecutor,
  standard: StandardExecutor,
  page_script: PageScriptExecutor,
};

export default class Sandbox {
  constructor(...args) {
    this.create(...args);
  }

  create(context = {}, type = 'standard') {
    this.type = type;
    this.context = context;
    this.context.user = this.context.user || store.redux.state('app.user');

    const executor = new (EXECUTORS[type] || EXECUTORS.default)(context, this);

    this.api = executor.context;
    this.executeScript = (...args) => executor.perform(...args);

    if (type === 'global') {
      Object.assign(window, this.api);
    }
  }

  getContext() {
    return this.api.p;
  }

  setErrorHandler(fn) {
    this.api.handleError = fn;
    return this;
  }
}
