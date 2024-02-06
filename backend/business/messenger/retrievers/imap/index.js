import Imap from 'imap';
import lodash from 'lodash-es';
import { simpleParser } from 'mailparser';

import logger from '../../../logger/index.js';
import parseMail from '../../util/parse-email.js';
import EmailSaver from '../../fetcher/save-email.js';
import { NUMBER_OF_MAIL } from '../../util/constants.js';

const getEmailsWithImap = async (envConfig, sandbox) => {
  try {
    const imap = new Imap(envConfig);
    imap.setTimeout();
    imap.once('ready', () => {
      imap.openBox('INBOX', false, () => {
        imap.search(['UNSEEN'/*, ['SINCE', new Date()]*/], (err, results) => {
          try {
            let fetchMail = imap.fetch(results, {bodies: ''});
            if (fetchMail.length > NUMBER_OF_MAIL) {
              fetchMail = lodash.slice(fetchMail, 0, NUMBER_OF_MAIL);
            }
            logger.info(`Reading ${fetchMail.length} emails`);


            fetchMail.on('message', (msg) => {
              msg.on('body', async (stream) => {
                const spMail = await simpleParser(stream);
                const parMail = parseMail(spMail);
                await new EmailSaver(parMail, spMail.attachments, sandbox).saveEmail();
              });
              msg.once('attributes', (attrs) => {
                const {uid} = attrs;
                imap.addFlags(uid, ['\\Seen'], () => {
                  // Mark the email as read after reading it
                });
              });
            });
            fetchMail.once('error', (e) => {
              logger.error(e);

            });
            fetchMail.once('end', () => {

              logger.info('Done reading emails!');
              imap.end();
            });
          } catch (ex) {
            logger.error('Error fetching all messages');
          }
        });
      });
    });

    imap.once('error', (err) => {
      logger.error(err);
    });

    imap.once('end', () => {
      logger.info('fetching done');
      logger.info('Connection ended');
    });

    imap.connect();
  } catch (er) {
    logger.error('an error occurred while connecting via IMAP', er);
  }
};

export default getEmailsWithImap;
