import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class LanguagePerformer extends BasePerformer {
  async getDependency() {
    return {
      user: await db.model('user').where({ language: this.record.id }),
    };
  }
}
