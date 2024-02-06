import { values, isString, isInteger, isObject } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';

export default async (field, operator, value, context) => {
  if (isObject(value)) {
    return values(value).join('/');
  } else if (isString(value)) {
    let [modelId, recordId] = value.split('/');
    if (!Number(modelId)) modelId = await getModelId(modelId);
    return [modelId, recordId].join('/');
  } else if (isInteger(value)) {
    return getValueFromCrossId(value);
  }

  return value;
};

const getModelId = (modelAlias) => {
  return db.model('model').pluck('id').where({ alias: modelAlias }).getOne();
}

const getValueFromCrossId = async (crossRecordId) => {
  const crossRecord = await db.model('global_references_cross').where({ id: crossRecordId }).getOne();
  return [crossRecord.target_model, crossRecord.target_record_id].join('/');
}
