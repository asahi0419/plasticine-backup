import db from '../../../../../../data-layer/orm/index.js';
import * as Errors from '../../../../../error/index.js';

export default (sandbox) => async (model, record, field, parentRecord, params = {}) => {
  if (!model) throw new Errors.ParamsNotValidError('Missing parameter \'model\' in utils.getConditionResult(...)');
  if (!record) throw new Errors.ParamsNotValidError('Missing parameter \'record\' in utils.getConditionResult(...)');
  if (!field) throw new Errors.ParamsNotValidError('Missing parameter \'field\' in utils.getConditionResult(...)');

  model = db.getModel(model);
  field = db.getField({ model: model.id, alias: field });

  if (!field) throw new Errors.FieldNotFoundError();

  if (typeof record === 'number') record = await db.model(model.alias).where({ id: record }).getOne();
  if (typeof record === 'object') record = await db.model(model.alias).where(record).getOne();

  if (!record) throw new Errors.RecordNotFoundError();

  if (parentRecord) await sandbox.addVariable('parentRecord', parentRecord);
  const result = await sandbox.executeScript(record[field.alias], `${model.alias}/${record.id}/${field.alias}`, { modelId: model.id });
  if (!result && params.error) throw new Errors[params.error.type](params.error.message);

  return result;
};
