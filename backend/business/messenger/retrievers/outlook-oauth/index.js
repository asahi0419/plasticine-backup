import lodash from 'lodash-es';

import logger from '../../../logger/index.js';
import EmailSaver from '../../fetcher/save-email.js';
import { OutlookClient } from '../../channels/outlook/outlook-client.js';
import { sandboxFactory } from '../../../sandbox/factory.js';

export default async (config) => {
  const client = new OutlookClient(config);

  const emails = await client.readEmail();
  if (!emails.length) return;

  logger.info(`Read ${emails.length} emails`);

  await lodash.forEach(emails, async (email, index) => {
    const sandbox = await sandboxFactory(process.env.APP_ADMIN_USER);
    logger.info(`Reading ${index + 1} of  ${emails.length} emails`);

    try {
      await new EmailSaver(email.mail, email.attachments, sandbox).saveEmail();
    } catch (e) {
      logger.error(e);
    }
  });

  logger.info(`done reading emails`);
};
