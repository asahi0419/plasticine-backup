import 'isomorphic-fetch';
import moment from 'moment';
import Promise from 'bluebird';
import lodash from 'lodash-es';
import { Client } from '@microsoft/microsoft-graph-client';
import { convert } from 'html-to-text';

import { OutlookOAuth } from './init-outlook.js';
import logger from '../../../logger/index.js';

const SPAM_DETECT_BODY = `Your message wasn't delivered because the recipient's email provider rejected it.`;
const SPAM_DETECT_PART_BODY = 'provider rejected';
const NUMBER_OF_MESSAGES = 100;

export class OutlookClient {
  constructor(config) {
    this.client = '';
    this.nextRefreshTime = '';
    this.config = config;
  }

  async #getClient() {
    const clientOptions = {
      authProvider: new OutlookOAuth(this.config),
    };

    this.client = Client.initWithMiddleware(clientOptions);
    this.nextRefreshTime = moment().add(1, 'hour');
  }

  async #getUserId() {
    const { id } = await this.client.api(`/users/${this.config.userPrincipalName}`).get();
    return id;
  }

  async #connectClient() {
    if (this.client === '' || moment().isAfter(this.nextRefreshTime)) {
      await this.#getClient();
    }
  }

  async #parseMailForSend(mail) {
    const parsedMail = {
      message: {
        subject: mail.subject,
        body: { contentType: mail.contentType, content: mail.text || mail.html },
        toRecipients: [{ emailAddress: { address: mail.to } }],
      },
    };
    if (mail.cc)
      parsedMail.message['ccRecipients'] = [
        { emailAddress: { address: mail.cc } },
      ];
    if (mail.attachments) {
      parsedMail.message['attachments'] = await Promise.all(
        mail.attachments.map((attachment) => {
          return {
            '@odata.type': '#microsoft.graph.fileAttachment',
            contentBytes: attachment.content.toString('base64'),
            name: attachment.filename,
          };
        })
      );
    }

    if(mail.headers['Content-Id']){
      parsedMail.message['InternetMessageHeaders'] = [{
        Name: 'X-Content-Id',
        Value: mail.headers['Content-Id']
      }];
    }

    return parsedMail;
  }

  async sendMail(options) {
    await this.#connectClient();
    const userId = await this.#getUserId();
    const parsedMail = await this.#parseMailForSend(options);

    try {
      await this.client.api(`/users/${userId}/sendMail`).post(parsedMail);
    } catch (e) {
      logger.error(e);
    }
  }

  async readEmail() {
    await this.#connectClient();
    const userId = await this.#getUserId();

    try {
      const rawEmail = await this.client.api(`/users/${userId}/mailFolders/Inbox/messages`)
        .top(NUMBER_OF_MESSAGES).filter('isRead ne true').get();
      let emails = await Promise.all(
        rawEmail.value.map(async (email) => {
          const mail = await this.#parsedMailForRead(email);

          if (
            mail.body === SPAM_DETECT_BODY ||
            mail.body.includes(SPAM_DETECT_PART_BODY)
          ) return;

          let attachments = [];
          if (email.hasAttachments) {
            attachments = lodash.compact(await this.#getAttachments(userId, email.id));
          }

          await this.#updateMessage(userId, email.id);

          return {
            mail,
            attachments,
          };
        })
      );

      emails = lodash.compact(emails);

      return emails;
    } catch (e) {
      logger.error(e);
    }
  }

  async #updateMessage(userId, messageId) {
    try {
      await this.client.api(`/users/${userId}/mailFolders/Inbox/messages/${messageId}`)
        .update({ isRead: true });
    } catch (e) {
      logger.error(e);
    }
  }

  async #getAttachments(userId, messageId) {
    try {
      const rawAttachments = await this.client.api(`/users/${userId}/mailFolders/Inbox/messages/${messageId}/attachments`)
        .get();
      return Promise.all(
        rawAttachments.value.map((attachment) => {
          if(attachment.contentBytes) {
            return {
              filename: attachment.name,
              contentType: attachment.contentType,
              content: Buffer.from(attachment.contentBytes, 'base64'),
            };
          }
        })
      );
    } catch (e) {
      logger.error(e);
    }
  }

  async #parsedMailForRead(mail = {}) {
    const { subject, from = {}, toRecipients = [], ccRecipients = [] } = mail;

    const [ to, cc ] = await Promise.all([ this.#parseAddress(toRecipients), this.#parseAddress(ccRecipients) ])

    return {
      from: from.emailAddress?.address,
      to: to || null,
      subject: subject || '**no subject**',
      cc: cc || null,
      body: convert(mail.body.content) || '**no email body**',
      type: 'in',
      status: 'new',
      content_type: 'text',
      created_by: 1,
      sent_at: mail.createdDateTime,
    };
  }

  #parseAddress(recipients) {
    let address='';
    recipients.forEach(({emailAddress})=> {
      if(emailAddress.address) address +=`${emailAddress.address}, `
    });

    return address.trim().slice(0, -1);
  }
}
