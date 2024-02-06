import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../logger/index.js';
import getTCross from './get-t-cross.js';

export default (sandbox) => async (record, refFieldAlias, dtfAlias) => {
  const templateReference = record.getField(refFieldAlias);

  const dtfModel = db.getModel(templateReference.getOptions().foreign_model);
  const dtfRecordId = record.getValue(refFieldAlias);

  try {
    const dtfField = dtfAlias
      ? db.getField({ model: dtfModel.id, alias: dtfAlias })
      : db.getField({ model: dtfModel.id, type: 'data_template' });

    return getTCross(sandbox)(dtfModel.alias, dtfRecordId, dtfField.alias);
  } catch (error) {
    logger.error(error);
  }
};
