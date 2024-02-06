import Promise from 'bluebird';

import db from '../../../data-layer/orm/index.js';
import { changeStatus } from '../../../business/background/planned/performers/helpers/helpers.js';
import logger from '../../../business/logger/index.js';

// https://github.com/OptimalBits/bull/issues/1098
async function removeJobs(jobs) {
  await Promise.map(jobs, (job) => job.remove().catch(e => console.error(e)));
};

export const cleanupPlannedTasks = async (processPlannedTasksQueue) => {
  logger.info(`cleanupPlannedTasks start`);
  const queueWorkers = await processPlannedTasksQueue.getWorkers();
  if (queueWorkers.length > 1) return;

  const waitingJobs = await processPlannedTasksQueue.getWaiting();
  const activeJobs = await processPlannedTasksQueue.getActive();

  await removeJobs(waitingJobs);
  await removeJobs(activeJobs);

  const planned = await db.model('planned_task').whereIn('status', ['in_progress', 'enqueued']);
  await Promise.each(planned, (task) => changeStatus(task, 'new')).catch(err => {
    logger.error(err);
  });

  logger.info(`cleanupPlannedTasks finish`);
}
