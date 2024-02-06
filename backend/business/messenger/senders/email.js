import aws from 'aws-sdk';
import Promise from 'bluebird';
import nodemailer from 'nodemailer';
import lodash from 'lodash-es';

import { getSetting } from '../../setting/index.js';
import { OutlookClient } from '../channels/outlook/outlook-client.js';

const DEFAULT_FROM_NAME = 'support';
const DEFAULT_FROM_ADDRESS = 'support@plasticine.software';

export default class EmailSender {
  constructor() {
    const config = getSetting('mailer').outgoing;

    switch (config.type) {
      case 'ses':
        config.SES = new aws.SES({
          ...config,
          region: config.region || 'us-east-1',
          apiVersion: config.apiVersion || '2010-12-01',
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        });
      case 'smtp':
        this.transport = nodemailer.createTransport(config);
        this.type = 'smtp';
        break;

      case 'outlook-oAuth':
      case 'outlook-oauth':
        const outlookConfig = getSetting('authorization.sso.strategies.azure.params');
        this.transport = new OutlookClient(outlookConfig);
        this.type = 'outlook-oAuth';
        break;
    }
  }

  async send(record, attachments) {
    const options = {
      subject: record.subject,
      to: record.to,
      from: {
        name: DEFAULT_FROM_NAME,
        address: DEFAULT_FROM_ADDRESS,
      },
      contentType: record.content_type,
    };

    options[record.content_type] = record.body;

    if (record.cc) options.cc = record.cc;
    if (record.from) options.from.address = record.from;

    if (this.type !== 'outlook-oAuth') {
      if (lodash.isObject(this.transport.options.from)) {
        options.from = { ...options.from, ...this.transport.options.from };
      }
    }

    if (lodash.isArray(attachments) && attachments.length) {
      let contentId ='';
      options.attachments = await Promise.all(
        lodash.map(attachments, async (attachment) => {
          const newId = attachment.record.cid;
          if (newId && !contentId.includes(newId.toString())) {
            contentId += (contentId === '' ? '' : ',') + newId;
          }

          return {
            filename: attachment.record.file_name,
            content: await attachment.getBuffer(),
            contentType: attachment.record.file_content_type,
          };
        })
      );
      options['headers'] = { 'Content-Id' : contentId };
    }

    return this.transport.sendMail(options);
  }
}
