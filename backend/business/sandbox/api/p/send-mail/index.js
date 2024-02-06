import db from '../../../../../data-layer/orm/index.js';
import Flags from '../../../../record/flags.js';
import { validateParams, linkAttachments, prepareParams } from './helpers.js';

export default sandbox => async (params = {}, attachments = [], permissions = {}) => {
  const fields = db.getFields({ model: db.getModel('email').id, type: 'string' });

  validateParams(params, fields, ['body', 'subject', 'to']);
  prepareParams(params, fields);

  const attributes = {
    target_record: params.target_record,
    type: 'out',
    to: params.to,
    cc: params.cc || null,
    subject: params.subject,
    body: params.body,
    from: params.from || null,
    content_type: params.content_type || 'html',
  };

  const flags = new Flags({ check_permission: false, ...permissions });
  const record = await db.model('email', sandbox).createRecord(attributes, flags);
  await linkAttachments(record, attachments, sandbox);

  return record;
};
