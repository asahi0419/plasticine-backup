import BasePerformer from './base.js';

export default class ScheduledTaskPerformer extends BasePerformer {
  getComponentsToCleanup() {
    return [
      { model: 'planned_task', field: 'scheduled_task' },
    ];
  }
}
