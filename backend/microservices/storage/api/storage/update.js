import { head } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import createStorage from '../../../../business/storage/factory.js';
import { RecordNotFoundError, NoPermissionsError, ParamsNotValidError } from '../../../../business/error/index.js';
import { findOwner } from './show.js';
import { createPermissionChecker } from '../../../../business/security/permissions.js';

export default async (req, res) => {
  try {
    const { __target_record: { modelId, recordId }, id, linked_from, file_name, file_content_type } = req.record;

    const file = head(req.files);
    file.originalname = Buffer.from(file.originalname, 'latin1').toString('utf8');
    const attachmentId = linked_from || id;
    const { originalname, buffer, mimetype, size } = file;
    if(file_name !== originalname){
      throw new ParamsNotValidError(`Form file name ${originalname} is not equal ${file_name}`);
    }

    const fileName = `attachments/${modelId}/${recordId}/${attachmentId}/${originalname}`;
    const storage = await createStorage();
    await storage.putObject(fileName, buffer, size, mimetype);
    const dbResponse = await db.model('attachment').where({id:attachmentId}).updateAndGetResult({file_size:size, updated_at: new Date()}, 'id');
    res.json(dbResponse);

  } catch (error) {
    res.error(error);
  }
};

export const checkUpdateAccess = async (req, res, next) => {
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
    const isCanCreate = createPermissionChecker(req.user, req.sandbox)('attachment', 'create', owner.model.id);
    const isCanCreatePhoto = createPermissionChecker(req.user, req.sandbox)('attachment', 'create_photo', owner.model.id);

    if (!isCanCreate && !isCanCreatePhoto) {
      throw new NoPermissionsError(`Model #${owner.model.id} (attachment/create)`);
    }
    next();
  } catch(error) {
    res.error(error);
  }
};

