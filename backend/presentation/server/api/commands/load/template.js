import { concat, map, each, isEmpty, isUndefined } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../../../business/helpers/index.js';
import { serializer, loadFields, loadExtraFieldsAttributes } from './helpers.js';

export default async (req, res, next) => {
  const { sandbox } = req;

  const result = { data: [], meta: {} };

  try {
    const field = db.getField({ id: +req.query.fieldId });
    if (isUndefined(field)) return res.json(result);
    const model = db.getModel(field.model, { silent: true });
    if (isUndefined(model)) return res.json(result);
    const record = await db.model(model.alias).where({ id: req.query.recordId }).getOne();
    if (isUndefined(record)) return res.json(result);
    const value = parseOptions(record[field.alias]);
    if (isEmpty(value)) return res.json(result);

    const tCross = await db.model('t_cross').where({ dvf_field_id: field.id, dvf_record_id: record.id }).getOne();
    const dataModel = db.getModel(tCross.data_model_id);
    const dataRecord = await db.model(dataModel.alias).where({ id: tCross.data_record_id }).getOne();

    await sandbox.assignRecord(dataRecord, dataModel);

    const fieldsIds = map(value.attr, ({ f }) => +f);
    const fields = await loadFields(dataModel, req.sandbox, { filter_in: 'id', filter: fieldsIds, accessible: true });
    const uiRules = await db.model('ui_rule').where({ model: dataModel.id, active: true, __inserted: true }).select('id', 'type', 'script', 'order');
    const extraFieldsAttributes = await loadExtraFieldsAttributes(fields);

    each(fields, (f) => field.readonly_when_script && (f.readonly_when_script = field.readonly_when_script));

    result.data = concat(
      serializer([dataModel], 'model', { translate: ['name', 'plural'], req }),
      serializer(fields, 'field', { translate: ['name', 'options', 'hint'], req }),
      serializer(uiRules, 'ui_rule'),
      serializer(extraFieldsAttributes, 'extra_fields_attribute'),
    );

    result.meta = {
      data_model_id: tCross.data_model_id,
      data_record_id: tCross.data_record_id,
    };

    res.json(result);
  } catch (error) {
    res.error(error);
  }
};
