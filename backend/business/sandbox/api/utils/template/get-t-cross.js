import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import { createManager } from '../../../../record/manager/factory.js';

export default (sandbox) => async (dtfModelAlias, dtfRecordId, dtfFieldAlias) => {
  try {
    const dtfModel = db.getModel(dtfModelAlias);
    const dtfField = db.getField({ model: dtfModel.id, alias: dtfFieldAlias });
    const dtfRecord = await db.model(dtfModelAlias).where({ id: dtfRecordId }).getOne();

    const tCrossRecord = await db.model('t_cross').where({
      dtf_field_id: dtfField.id,
      dtf_record_id: dtfRecord.id,
    }).whereNull('data_record_id').getOne();

    if (!tCrossRecord) return;

    const template = { value: dtfRecord[dtfFieldAlias] };

    const dataModel = await db.model('model').where({ data_template: tCrossRecord.id }).getOne();
    const dataRecord = await (await createManager({ ...dataModel, template }, sandbox, false)).create({});

    return {
      dtf_field_id: dtfField.id,
      dtf_record_id: dtfRecordId,
      data_model_id: dataModel.id,
      data_record_id: dataRecord.id,
    };
  } catch (error) {
    logger.error(error);
  }
};
