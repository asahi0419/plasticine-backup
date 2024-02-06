import Promise from 'bluebird';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../../business/logger/index.js';
import { getSetting } from '../../../../../business/setting/index.js';

const JOB_TIME_OUT = 30 * 60 * 1000;

const getThresholdDate = (timeout) => {
  const date = new Date();
  date.setTime(date.getTime() - timeout);
  return date;
};

export default (sandbox, processingQueue) => async (job) => {
  const mailerSettings = getSetting('mailer').incoming;
  if (!mailerSettings.enabled) return;

  const newEmails = await db.model('email')
    .where({ type: 'in', status: 'new', __inserted: true })
    .orderBy('id', 'asc')
    .limit(100);

  const stackedEmails = await db.model('email')
    .where({ type: 'in', status: 'enqueued', __inserted: true })
    .where('worker_ts', '<=', getThresholdDate(JOB_TIME_OUT));

  logger.info(`Fetching emails to process (${newEmails.length} new / ${stackedEmails.length} stacked)`);

  try {
    await enqueueEmails(newEmails, processingQueue, sandbox);
    // await processStackedEmails(stackedEmails, processingQueue, sandbox);
  } catch (error) {
    logger.error(error);
  }
};

async function enqueueEmails(emails, queue, sandbox) {
  await Promise.each(emails, async (email) => {
    const record = await db.model('email', sandbox).updateRecord(email, { status: 'enqueued' });
    queue.add({ record });
    logger.info(`Enqueue email processing #${email.id}`);
  });
}