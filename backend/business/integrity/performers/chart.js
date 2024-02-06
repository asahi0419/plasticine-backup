import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class ChartPerformer extends BasePerformer {
  async getDependency() {
    return {
      view: await db.model('view').where({ chart: this.record.id }),
    };
  }
}
