import Promise from 'bluebird';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../../business/logger/index.js';
import { getSetting } from '../../../../../business/setting/index.js';

const JOB_TIME_OUT = 30 * 60 * 1000;
const SEND_INTERVAL_MS = 500;

const getThresholdDate = (timeout) => {
  const date = new Date();
  date.setTime(date.getTime() - timeout);
  return date;
};

export default (sandbox, sendingQueue) => async (job) => {
  const settings = getSetting('mailer.outgoing');
  if (!settings.enabled) return;

  const newEmails = await db.model('email')
    .where({ type: 'out', status: 'new', __inserted: true });

  const stackedEmails = await db.model('email')
    .where({ type: 'out', status: 'enqueued', __inserted: true })
    .where('worker_ts', '<=', getThresholdDate(JOB_TIME_OUT));

  logger.info(`Fetching emails to send (${newEmails.length} new / ${stackedEmails.length} stacked)`);

  try {
    await enqueueEmails(newEmails, sendingQueue, sandbox);
    // await processStackedEmails(stackedEmails, sendingQueue, sandbox);
  } catch (error) {
    logger.error(error);
  }
};


async function enqueueEmails(emails, queue, sandbox) {
  const settings = getSetting('mailer.outgoing');

  await Promise.each(emails, async (email) => {
    await new Promise((resolve) => {
      setTimeout(async () => {
        const record = await db.model('email', sandbox).updateRecord(email, { status: 'enqueued' });
        queue.add({ record });
        logger.info(`Enqueue email sending #${email.id}`);
        resolve();
      }, settings.send_interval_ms || SEND_INTERVAL_MS);
    });
  });
}

// function processStackedEmails(emails, sendingQueue, sandbox) {
//   const emailsMap = keyBy(emails, 'id');

//   const processInactive = (jobs) => Promise.map(jobs, (job) => {
//     const email = emailsMap[job.data.id];
//     return email && db.model('email', sandbox).updateRecord(email, { worker_ts: new Date() })
//       .then((email) => {
//         job.data = email;
//         return new Promise((resolve, reject) => job.update(err => (!err ? resolve() : reject(err))));
//       })
//       .then(() => delete emailsMap[email.id]);
//   });

//   const processActive = (jobs) => Promise.map(jobs, (job) => {
//     const email = emailsMap[job.data.id];
//     return email && db.model('email', sandbox).updateRecord(email, { worker_ts: new Date() })
//       .then(() => delete emailsMap[email.id]);
//   });

//   return Promise.all([
//     selectJobs(queue, { state: 'inactive', type: SENDER_JOB_NAME }),
//     selectJobs(queue, { state: 'active', type: SENDER_JOB_NAME }),
//   ])
//     .then(([inactiveJobs, activeJobs]) => Promise.all([
//       processInactive(inactiveJobs),
//       processActive(activeJobs),
//     ]))
//     .then(() => {
//       const notFoundEmails = Object.values(emailsMap);
//       if (!notFoundEmails.length) return;
//       logger.info(`${notFoundEmails.length} of stacked emails will be added to the queue`);
//       return enqueueEmails(queue, notFoundEmails, sandbox);
//     });
// }
