import Promise from 'bluebird';

import db from '../../data-layer/orm/index.js';
import logger from '../logger/index.js';
import createSender from './senders/index.js';
import ModelProxy, { wrapRecord } from '../sandbox/api/model/index.js';
import * as Retrievers from './retrievers/index.js';
import { getSetting } from '../setting/index.js';

export default class Messenger {
  constructor(type, sandbox) {
    this.sandbox = sandbox;
    this.type = type;
    this.sender = createSender(type);
  }

  async send(record) {
    const manager = await db.model(this.type, this.sandbox).getManager();

    try {
      const attachments = await getAttachments(record, this.sandbox);
      const result = await this.sender.send(record, attachments);
      await manager.update(record, { status: 'processed' });

      return result;
    } catch (error) {
      await manager.update(record, { status: 'error' });
      logger.error(error);
    }
  }

  async retrieve(config = {}) {
    switch (config.type) {
      case 'pop':
        return Retrievers.pop(config, this.sandbox);
      case 'imap':
        return Retrievers.imap(config, this.sandbox);
      case 'outlook-oauth':
      case 'outlook-oAuth':
        const outlookConfig = getSetting('authorization.sso.strategies.azure.params');
        return Retrievers.outlookOauth(outlookConfig,this.sandbox);
      default:
        logger.error('Unknown type');
    }
  }

  async process(record) {
    const manager = await db.model(this.type, this.sandbox).getManager();
    const processing = await db.model('incoming_emails_processing')
      .where({ active: true, __inserted: true })
      .orderBy('id', 'asc');

    try {
      const sandbox = await this.sandbox.cloneWithoutDynamicContext();
      await sandbox.assignRecord(record, db.getModel('email'));

      const result = await Promise.reduce(processing, async (r, p = {}) => {
        const c = await sandbox.executeScript(p.condition, `incoming_emails_processing/${p.id}/condition`);
        if (c) r = await sandbox.executeScript(p.script, `incoming_emails_processing/${p.id}/script`);
        return r;
      }, null) || {};
      
      const attributes = { status: 'processed' };
      if (result.model && result.id) attributes.target_record = result;

      await manager.update(record, attributes);
    } catch (error) {
      await manager.update(record, { status: 'error' });
      logger.error(error);
    }
  }
}

async function getAttachments(record, sandbox) {
  const modelProxy = new ModelProxy(db.getModel('email'), sandbox);
  const recordProxy = await wrapRecord(modelProxy)(record);
  return recordProxy.getAttachments();
}
