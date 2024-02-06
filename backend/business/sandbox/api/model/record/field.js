import { parseOptions } from '../../../../helpers/index.js';

export default class FieldProxy {
  constructor(field, recordProxy) {
    this.field = field;
    this.id = field.id;
    this.alias = field.alias;
    this.type = field.type;
    this.model = field.model;
    this.recordProxy = recordProxy;
  }

  getOptions() {
    return parseOptions(this.field.options);
  }

  getValue() {
    return this.recordProxy.getValue(this.alias);
  }

  getVisibleValue() {
    return this.recordProxy.getVisibleValue(this.alias);
  }

  setValue(newValue) {
    return this.recordProxy.setValue(this.alias, newValue);
  }

  getComments() {
    return this.recordProxy.getComments(this.alias);
  }

  async setComments(comments) {
    await this.recordProxy.setComments(this.alias, comments);
  }
}
