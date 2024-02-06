import { orderBy, map } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import RecordProxy from './index.js';
import createStorage from '../../../../storage/factory.js';
import { findRecordAttachments } from './index.js';
import { ParamsNotValidError } from '../../../../error/index.js';

export default class AttachmentProxy extends RecordProxy {
  get fields() {
    return db.getFields({ model: db.getModel('attachment').id });
  }

  async getContent() {
    const buffer = await this.getBuffer();

    return buffer.toString('utf8');
  }

  async getFileMeta() {
    const storage = await createStorage();
    const path = await this.getPath();

    try{
    return await storage.statObject(path);
    }catch(err){
      return err.message
    }
  }


  async getPath() {
    return getAttachmentKey(this);
  }

  async getBuffer() {
    if (this.buffer) return this.buffer;

    try {
      const path = await this.getPath();

      return readAttachment(path);
    } catch (error) {
      logger.error(error);
    }
  }

  setBuffer(buffer) {
    this.buffer = buffer;
    this.setValue('file_size', buffer.byteLength);

    return this;
  }

  relateTo(record) {
    return transferAttachmentToRecord(this, record, 'relate');
  }

  copyTo(record, fileName) {
    return transferAttachmentToRecord(this, record, 'copy', fileName);
  }

  linkTo(record) {
    return transferAttachmentToRecord(this, record, 'link');
  }

  async rename(newName){
    if (!this.isPersisted()) return false;

    await db.model('attachment', this.sandbox)
      .updateRecord(this.attributes, { file_name: newName }, false);

    return true;
  }
}

async function getAttachmentKey(attachment, record) {
  if (record) return `attachments/${record.model.id}/${record.id}/${attachment.id}/${attachment.file_name}`;

  if (attachment.id) {
    const id = attachment.getValue('linked_from') || attachment.getValue('id');
    const model = db.getModel('attachment');
    const field = db.getField({ model: model.id, alias: 'target_record' });
    const fileName = attachment.getPrevValue('file_name') || attachment.getValue('file_name');
    const crossRecord = await db.model('global_references_cross').where({
      source_field: field.id,
      source_record_id: id
    }).getOne();

    return `attachments/${crossRecord.target_model}/${crossRecord.target_record_id}/${id}/${fileName}`;
  }
}

async function readAttachment(key) {
  const storage = await createStorage();
  const stream = await storage.getObject(key);

  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on('error', reject);
    stream.on('data', (data) => buffers.push(data));
    stream.on('end', () => resolve(Buffer.concat(buffers)));
  });
}

async function createNewAttachment(attachment, record, mode, fileName) {
  const attributes = { ...attachment.attributes, target_record: record.attributes };
  attributes.file_name = fileName || attributes.file_name;

  if (mode === 'link') {
    if (attachment.attributes.id) {
      attributes.linked_from = attachment.attributes.id;
    }
  } else {
    const similarAttachments = await findRecordAttachments(record.model, record, { file_name: attributes.file_name });

    if (similarAttachments.length) {
      if (record.model.versionable_attachments) {
        const version = +orderBy(similarAttachments, ['version'], ['desc'])[0].version + 1;
        await db.model('attachment').whereIn('id', map(similarAttachments, 'id')).update({ last_version: false });

        attributes.version = version;
      } else {
        await db.model('attachment').whereIn('id', map(similarAttachments, 'id')).delete();
      }
    }
  }

  return db.model('attachment', attachment.sandbox).createRecord(attributes, false);
}

async function transferAttachmentToRecord(attachment, record, mode, fileName) {
  const { model, sandbox, attributes } = attachment;
  const { id, file_size, file_content_type } = attributes;
  const buffer = await attachment.getBuffer();

  if (!record || (record.constructor.name !== 'RecordProxy')) {
    throw new ParamsNotValidError(sandbox.translate(`static.please_use_record_instance_to_perform_attachment_action`, { action: `attachment.${mode}To(...)` }));
  }

  const storage = await createStorage();

  const source = await getAttachmentKey(attachment);
  const targetRecord  = await createNewAttachment(attachment, record, mode, fileName);
  await updateCId(record, mode, targetRecord);
  const target = await getAttachmentKey(targetRecord, record);

  if (!source) {
    await storage.putObject(target, buffer, file_size, file_content_type);

    return true;
  }

  if (mode === 'relate') {
    await storage.copyObject(target, source);
    await storage.removeObject(source);

    await db.model(model, sandbox).destroyRecord({ id });
  }

  if (mode === 'copy') {
    if(fileName){
      await storage.putObject(target, buffer, file_size, file_content_type);
    }
    else {
      await storage.copyObject(target, source);
    }
  }

  return true;
}

const updateCId = async (record, mode, attachment) => {
  if(mode !== 'link') return;

  if(!attachment.id) {
    const { id } = await db.model('global_references_cross').where({target_record_id: record.id}).getOne();
    attachment = await db.model('attachment').where({target_record: id}).getOne()
  }
  const cid = attachment.cid ? `cid-${attachment.cid}` :  attachment.linked_from ? `linked-${attachment.linked_from}` : `attach-${attachment.id}`;

  await db.model('attachment').where({ id: attachment.id }).update({ cid });
};
