import db from '../../../../data-layer/orm/index.js';
import createStorage from '../../../../business/storage/factory.js';
import { RecordNotFoundError, NoPermissionsError } from '../../../../business/error/index.js';
import { createPermissionChecker } from '../../../../business/security/permissions.js';

export default async (req, res) => {
  const { __target_record: { modelId, recordId }, id, linked_from, file_name, file_content_type, file_size } = req.record;
  const attachmentId = linked_from || id;
  const storage = await createStorage();

  storage.getObject(`attachments/${modelId}/${recordId}/${attachmentId}/${file_name}`)
    .then((stream) => {
      if (req.query.disposition === 'attachment') {
        res.setHeader('Content-Disposition', 'attachment');
      }

      res.setHeader('Content-Type', file_content_type);
      res.setHeader('Content-Length', file_size);
      stream.pipe(res);
    })
    .catch(res.error);
};

export const checkReadAccess = async (req, res, next) => {
  const { id } = req.params;

  try {
    const attachment = await db.model('attachment').where({ id }).getOne();
    if (!attachment) throw new RecordNotFoundError();

    const owner = await findOwner(attachment);
    await req.sandbox.assignRecord(owner.record, owner.model);

    req.record = {
      ...attachment,
      __target_record: {
        modelId: owner.model.id,
        recordId: owner.record.id,
      },
    };

    const { exportDocxPdf } = req.query
    if (exportDocxPdf)  return next();
    if (!createPermissionChecker(req.user, req.sandbox)('attachment', 'view', owner.model.id)) {
      throw new NoPermissionsError(`Model #${owner.model.id} (attachment/view)`);
    }

    next();
  } catch(error) {
    res.error(error);
  }
};

export async function findOwner(attachment) {
  const attachmentTargetRecordField = db.getField({ model: db.getModel('attachment').id, alias: 'target_record' });
  const crossRecord = await db.model('global_references_cross')
    .where({
      source_field: attachmentTargetRecordField.id,
      source_record_id: attachment.linked_from || attachment.id
    })
    .getOne();

  return loadOwner(crossRecord);
}

async function loadOwner({ target_model, target_record_id }) {
  return {
    model: db.getModel(target_model),
    record: await db.model(target_model).where({ id: target_record_id }).getOne(),
  };
}
