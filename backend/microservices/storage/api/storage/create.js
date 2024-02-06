import Promise from 'bluebird';
import Multer from 'multer';

import db from '../../../../data-layer/orm/index.js';
import Flags from '../../../../business/record/flags.js';
import * as HELPERS from './helpers.js';
import createStorage from '../../../../business/storage/factory.js';
import { createPermissionChecker, updatePermissionsFromParent } from '../../../../business/security/permissions.js';
import { ModelNotFoundError, RecordNotFoundError, NoPermissionsError } from '../../../../business/error/index.js';

function updateAttachment(file, attachment, record, fieldId, sandbox, flags, lastSimilarAttachment) {
  return db.model('attachment', sandbox).updateRecord(attachment, {
    target_record: record,
    field: fieldId,
    file_name: file.originalname,
    file_content_type: file.mimetype,
    file_size: file.size,
    version: lastSimilarAttachment ? +lastSimilarAttachment.version + 1 : 1,
    last_version: true,
  }, flags);
}

const processFile = async (req, file, context) => {
  const { originalname, buffer, mimetype, size } = file;
  const flags = new Flags({ ignorePermissions: true });
  const fieldId = context && context.field ? parseInt(context.field) : null;

  if (fieldId) {
    const field = db.getField({ id: fieldId });
    if (field) await db.model(req.model).where({ id: req.record.id }).update({ [field.alias]: file.originalname });
  }

  await HELPERS.checkFileFormat(originalname, req.sandbox);

  let attachment = await db.model('attachment', req.sandbox).buildRecord({
    field: fieldId,
    file_content_type: mimetype,
    file_size: size,
    file_name: originalname,
    target_record: req.record,
    p_lat: req.record.p_lat || null,
    p_lon: req.record.p_lon || null,
  }, flags, true);

  const fileName = `attachments/${req.model.id}/${req.record.id}/${attachment.id}/${originalname}`;
  const storage = await createStorage();
  await storage.putObject(fileName, buffer, size, mimetype);

  const similarAttachmentsScope = db.model('attachment')
    .where({ file_name: originalname, field: fieldId })
    .whereIn('id', req.record.__attachmentsIds);
  const lastSimilarAttachment = await similarAttachmentsScope
    .orderBy('version', 'desc').getOne();

  if (!lastSimilarAttachment) {
    attachment = await updateAttachment(file, attachment, req.record, fieldId, req.sandbox, flags);
  } else if (!req.model.versionable_attachments) {
    attachment = await updateAttachment(file, attachment, req.record, fieldId, req.sandbox, flags);
    await similarAttachmentsScope.delete();
  } else {
    attachment = await updateAttachment(file, attachment, req.record, fieldId, req.sandbox, flags, lastSimilarAttachment);
    await similarAttachmentsScope.update({ last_version: false });
  }

  return attachment;
};

export default async (req, res) => {
  try {
    const attachmentTargetRecordField = db.getField({ model: db.getModel('attachment').id, alias: 'target_record' });
    const records = await db.model('global_references_cross').where({
      target_model: req.model.id,
      target_record_id: req.record.id,
      source_field: attachmentTargetRecordField.id,
    }).select('source_record_id');

    req.record.__attachmentsIds = records.map(({ source_record_id }) => source_record_id);

    const filesContext = req.body.context || [];
    const attachments = await Promise.map(req.files, (file, i) => {
      file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
      return processFile(req, file, filesContext[i] || {});
    });

    res.serialize(attachments);
  } catch (error) {
    res.error(error);
  }
};

export const checkCreateAccess = async (req, res, next) => {
  const { modelAlias, recordId } = req.params;
  const attachmentModel = db.getModel('attachment');

  try {
    const model = db.getModel(modelAlias);
    if (!model) throw new ModelNotFoundError();

    req.model = model;

    const record = await db.model(modelAlias).where({ id: recordId }).getOne();
    if (!record) throw new RecordNotFoundError();

    req.record = record;
    req.record.__type = model.alias;

    await req.sandbox.assignRecord(record, req.model);
    updatePermissionsFromParent(req.user, attachmentModel, model);

    if (!createPermissionChecker(req.user, req.sandbox)('attachment', 'create', model.id)) {
      throw new NoPermissionsError(`${model.name} (attachment/create)`);
    }

    next();
  } catch (error) {
    res.error(error);
  }
};

export const processParams = (req, res, next) =>
  Multer({ storage: Multer.memoryStorage() }).any()(req, res, next);

export const addGpsCoordinatesToRecord = (req, _, next) => {
  req.record.p_lat = req.query.lat;
  req.record.p_lon = req.query.lon;
  next();
};
