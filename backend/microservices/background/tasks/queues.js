import QueueManager from '../queue-manager.js';
import { cleanupPlannedTasks } from './cleanup.js';

import autoLogoutProcessor from './processors/auto-logout.js';
import fetchPlannedTasksProcessor from './processors/fetch-planned-tasks.js';
import processPlannedTasksProcessor from './processors/process-planned-tasks.js';
import vacuumRecordsProcessor from './processors/vacuum-records.js';
import timestampSaver from '../utils/timestamp-saver.js';

const REDIS_CONFIG = {
  keyPrefix: `${process.env.APP_NAME}.q.tasks`,
  host: process.env.REDIS_CORE_HOST,
};

const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: true,
  attempts: 1,
};

export const QUEUE_INTERVAL = 15;

export default async () => {
  const queueManager = new QueueManager(REDIS_CONFIG);

  // On request queues
  const processPlannedTasksQueue = queueManager.create('Process planned tasks',
    processPlannedTasksProcessor,
    { ...DEFAULT_JOB_OPTIONS, concurrency: 10 }
  );

  await timestampSaver(process.env.SERVICE_NAME);
  await cleanupPlannedTasks(processPlannedTasksQueue);

  // Repeat every N seconds
  queueManager.create('Fetch planned tasks', async (job) => {
    await timestampSaver(process.env.SERVICE_NAME);
    await fetchPlannedTasksProcessor(processPlannedTasksQueue)(job);
  },
  { ...DEFAULT_JOB_OPTIONS, repeat: { cron: `*/${QUEUE_INTERVAL} * * * * *`}}
  );

  // Repeat every minute
  queueManager.create('Auto logout',
    autoLogoutProcessor,
    { ...DEFAULT_JOB_OPTIONS, repeat: { cron: '* * * * *' }}
  );

  queueManager.create('Vacuum records',
    vacuumRecordsProcessor,
    { ...DEFAULT_JOB_OPTIONS, repeat: { cron: '0 0 * * *' }}
  );

  return queueManager;
};
