import QueueManager from '../../queue-manager.js';
import fetchEmailsToProcess from './processors/fetch-emails-to-process.js';
import processEmails from './processors/process-emails.js';
import timestampSaver from '../../utils/timestamp-saver.js';

const REDIS_CONFIG = {
  keyPrefix: `${process.env.APP_NAME}.q.mails.processor`,
  host: process.env.REDIS_CORE_HOST,
};

const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: true,
  attempts: 1,
};

export const QUEUE_INTERVAL = 10;
export default async (sandbox) => {
  const queueManager = new QueueManager(REDIS_CONFIG);

  const processEmailsQueue = queueManager.create('Process emails',
    processEmails(sandbox),
    { ...DEFAULT_JOB_OPTIONS, concurrency: 20 }
  );

  queueManager.create('Fetch emails to process',
    async (job) => {
      await timestampSaver(process.env.SERVICE_NAME);
      await fetchEmailsToProcess(sandbox, processEmailsQueue)(job);
    },
    { ...DEFAULT_JOB_OPTIONS, repeat: { cron: `*/${QUEUE_INTERVAL} * * * * *` } }
  );

  return queueManager;
};
