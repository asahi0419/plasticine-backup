import Promise from 'bluebird';
import * as MailParser from 'mailparser';

import logger from '../../../logger/index.js';
import Client from './client.js';
import parseMail from '../../util/parse-email.js';
import EmailSaver from '../../../messenger/fetcher/save-email.js';
import * as Constants from '../../util/constants.js';

export default async (config = {}, sandbox) => {
  const client = new Client({
    enabletls: !!config.tls.rejectUnauthorized,
    ignoretlserrs: true,
    debug: false,
  });

  await client.connect({
    host: config.host,
    port: config.port,
  });

  await client.login({
    user: config.auth.user,
    pass: config.auth.pass,
  });

  const list = await client.list();

  let count = list.msgcount;
  if (count > Constants.NUMBER_OF_MAIL) count = Constants.NUMBER_OF_MAIL;

  if (count) {
    logger.info(`Reading ${count} emails`);

    await Promise.each(Array(count), async (c, i) => {
      const index = i + 1;

      logger.info(`Reading ${index} of ${count} emails`);
      
      try {
        const result = await client.retr(index);

        const email = await MailParser.simpleParser(result.data);
        await new EmailSaver(parseMail(email), email.attachments, sandbox).saveEmail();

        await client.dele(index);
      } catch (error) {
        logger.error(error);
      }
    });

    logger.info(`Done reading ${count} emails`);
  }

  await client.quit();
};
