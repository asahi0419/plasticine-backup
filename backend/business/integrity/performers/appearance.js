import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class AppearancePerformer extends BasePerformer {
  async getDependency() {
    return {
      view: await db.model('view').where({ appearance: this.record.id }),
    };
  }
}
