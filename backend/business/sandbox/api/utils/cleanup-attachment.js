import db from '../../../../data-layer/orm/index.js';
import logger from '../../../logger/index.js';
import createStorage from '../../../storage/factory.js';
import Promise from "bluebird";

export default (sandbox) => async () => {
  try {
    let numberOfUnrelated = 0;

    const storage = await createStorage();
    const attachments = await db.model("attachment").where({linked_from: null, __inserted: true});

    await Promise.each(attachments, async (attachment) => {
      if (!attachment.target_record) {
        await db.model('attachment').where({id: attachment.id}).delete();
        numberOfUnrelated++;
        return;
      }

      const crossRecords = await db.model('global_references_cross').where({id: attachment.target_record}).getOne();
      if(!crossRecords|| !crossRecords.target_model|| !crossRecords.target_record) return;

      const path = `attachments/${crossRecords.target_model}/${crossRecords.target_record_id}/${attachment.id}/${attachment.file_name}`;
      try {
        await storage.statObject(path);
      } catch (err) {
        await db.model('attachment').where({id: attachment.id}).delete();
        await db.model('global_references_cross').where({id: crossRecords.id}).delete();
        numberOfUnrelated++;
      }
    });

    return {
      checked_amount: attachments.length,
      unrelated_deleted: numberOfUnrelated
    };
  } catch (error) {
    logger.error(error);
  }
}
