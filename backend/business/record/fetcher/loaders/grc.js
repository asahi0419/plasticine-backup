import { isArray, isEmpty, isNumber, filter, find, each, reduce } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';

// Used by fetcher and sandbox
export default async (records, model, options = {}) => {
  const { fieldset, sandbox } = options;

  records = filter(records, (r) => !isEmpty(r) && r.id);
  if (!records.length) return { records };

  let fields = db.getFields({ model: model.id, type: 'global_reference' });
  if (isArray(options.fieldset) && options.fieldset.length) {
    fields = filter(fields, ({ alias }) => options.fieldset.includes(alias));
  }

  if (!fields.length) return { records };

  const grcIds = reduce(records, (result, record) => {
    each(fields, (field) => {
      const id = record[field.alias];
      if (isNumber(id)) result.push(id);
    });
    return result;
  }, []);
  const grcRows = await db.model('global_references_cross').whereIn('id', grcIds);

  each(records, (record) => {
    each(fields, (field) => {
      const id = record[field.alias];
      if (!isNumber(id)) return;

      const grcRow = find(grcRows, { id });
      if (!grcRow) return;

      record[field.alias] = {
        model: grcRow.target_model,
        id: grcRow.target_record_id,
      }
    });
  });

  return { records, grcFields: fields, preloadedGRCRecords: grcRows };
};
