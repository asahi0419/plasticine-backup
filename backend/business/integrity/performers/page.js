import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class PagePerformer extends BasePerformer {
  async getDependency() {
    return {
      form: await db.model('form').where({ page: this.record.id }),
    };
  }
}
