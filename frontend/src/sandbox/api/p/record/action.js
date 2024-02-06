import { parseOptions } from '../../../../helpers';

export default class Action {
  constructor(action, recordProxy) {
    this.action = action;
    this.id = action.id;
    this.alias = action.alias;
    this.type = action.type;
    this.model = action.model;
    this.recordProxy = recordProxy;
  }

  setVisible(state) {
    this.recordProxy.record.setActionAsVisible(this.alias, state);
  }

  getOptions() {
    return parseOptions(this.action.options);
  }
}
