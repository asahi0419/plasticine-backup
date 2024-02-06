import { isNumber, isArray, some, map, pick } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import loadRTLs from '../../../../../business/record/fetcher/loaders/rtl.js';
import ValueExtractor from '../../../../../business/record/humanizer/types/value-extractor.js';
import { humanize } from '../../../../../business/record/fetcher/humanizer/index.js';

import { getSetting } from '../../../../../business/setting/index.js';

export default async (req, res) => {
  const { query: { filter, label = 'id', extra_fields } } = req;

  try {
    const records = await db.model(req.model, req.sandbox).fetchRecords(filter);
    const options = await generateOptions(req, records, label);

    const extraFields = await getExtraFields(req.model, extra_fields);

    res.json({
      records: map(records, (record) => pick(record, ['id', 'alias', 'model', ...map(extraFields, 'alias')])),
      options,
    });
  } catch (error) {
    res.error(error);
  }
};

const generateOptions = async ({ model, sandbox }, records, valueLabel) => {
  if (isNumber(valueLabel)) valueLabel = (db.getField({ id: valueLabel }) || {}).alias;

  await loadRTLs(records, model, { sandbox });
  const valueExtractor = new ValueExtractor(valueLabel);

  await humanize(model.id, valueExtractor.fields, records, sandbox, undefined, { currentDepthReferenceObjSearch: getSetting('limits.lookup_max_ref_obj_search')} );

  return map(records, (record) => {
    let text = valueExtractor.extract(record);
    if (isArray(text)) text = text.join(', ');
    return ({ text, value: record.id });
  });
};

const getExtraFields = async (model, extra_fields) => {
  if (!isArray(extra_fields)) return [];
  if (!extra_fields.length) return [];

  return some(extra_fields, Number)
    ? await db.model('field').whereIn('id', extra_fields)
    : await db.model('field').where({ model: model.id }).whereIn('alias', extra_fields);
};
