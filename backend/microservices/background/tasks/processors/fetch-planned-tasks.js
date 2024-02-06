import Promise from 'bluebird';

import db from '../../../../data-layer/orm/index.js';
import logger from '../../../../business/logger/index.js';
import { changeStatus } from '../../../../business/background/planned/performers/helpers/helpers.js';

export default (queue) => async () => {
  const tasks = await db.model('planned_task')
    .where({ status: 'new', __inserted: true })
    .where('scheduled_on', '<=', new Date())
    .andWhere(function () {
      this.whereNotNull('escalation_rule').orWhere(function() {
      this.whereNotNull('scheduled_task') })
    });

  logger.info(`Fetching planned tasks (${tasks.length} new)`);

  await Promise.each(tasks, async (task) => {
    try {
      await changeStatus(task, 'enqueued');
      queue.add(task);
      logger.info(`Added planned task #${task.id} to processing queue`);
    } catch (err) {
      logger.error(err);
      await changeStatus(task, 'error');
    }
  });
};
