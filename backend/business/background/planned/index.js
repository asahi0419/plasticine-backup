import * as PERFORMERS from './performers/index.js';

export default class PlannedManager {
  constructor(exec, sandbox) {
    this.exec = exec;
    this.sandbox = sandbox;
    this.performer = new PERFORMERS[exec.__type](exec, sandbox);
  }

  async perform(action, task) {
    return this.performer[action](task);
  }
}
