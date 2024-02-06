import db from '../../data-layer/orm/index.js';

export default class Performer {
  constructor(model, sandbox) {
    this.model = model;
    this.sandbox = sandbox;
  }

  perform(action) {
    return this[action]();
  }

  create() {
    return this.createTemplateRecord();
  }

  async createTemplateRecord(attributes = {}) {
    try {
      const manager = await db.model(`${this.model.alias}`, this.sandbox).getManager(false);
      return manager.create(attributes);
    } catch (error) {
      error.name !== 'ModelNotFoundError' && console.error(error);
    }
  }
}
