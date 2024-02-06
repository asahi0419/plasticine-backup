import QueueManager from '../../queue-manager.js';

import fetchEmailsToSend from './processors/fetch-emails-to-send.js';
import sendEmails from './processors/send-emails.js';
import timestampSaver from '../../utils/timestamp-saver.js';

const REDIS_CONFIG = {
  keyPrefix: `${process.env.APP_NAME}.q.mails.sender`,
  host: process.env.REDIS_CORE_HOST,
};

const DEFAULT_JOB_OPTIONS = {
  removeOnComplete: true,
  attempts: 1,
};

export const QUEUE_INTERVAL = 10;
export default async (sandbox) => {
  const queueManager = new QueueManager(REDIS_CONFIG);

  const sendEmailsQueue = queueManager.create('Send emails',
    sendEmails(sandbox),
    { ...DEFAULT_JOB_OPTIONS, concurrency: 20 }
  );

  queueManager.create('Fetch emails to send',
    async (job) => {
      await timestampSaver(process.env.SERVICE_NAME);
      await fetchEmailsToSend(sandbox, sendEmailsQueue)(job);
    },
    {...DEFAULT_JOB_OPTIONS, repeat: {cron: `*/${QUEUE_INTERVAL} * * * * *`}}
  );

  return queueManager;
};
