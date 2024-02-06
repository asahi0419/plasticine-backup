import db from '../../../data-layer/orm/index.js';
import BasePerformer from './base.js';

export default class EscalationRulePerformer extends BasePerformer {
  async getDependency() {
    return {
      planned_task: await db.model('planned_task').where({ escalation_rule: this.record.id }),
    };
  }
}
