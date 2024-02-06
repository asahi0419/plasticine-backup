import Promise from 'bluebird';
import { chunk, isArray, isEmpty, map, filter, groupBy } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import FilterService from '../../../filter/index.js';

// Used by fetcher and sandbox
export default async (records, model, options = {}) => {
  const { fieldset, sandbox } = options;

  records = filter(records, (r) => !isEmpty(r) && r.id);
  if (!records.length) return { records };

  let fields = options.fields || db.getFields({ model: model.id, type: 'reference_to_list' });
  if (isArray(options.fieldset) && options.fieldset.length) {
    fields = filter(fields, ({ alias }) => options.fieldset.includes(alias));
  }

  if (!fields.length) return { records };

  const recordsIds = map(records, 'id');
  const fieldsIds = map(fields, 'id');
  const rtlRows = await Promise.reduce(chunk(recordsIds, 10000), async (result, ids) => {
    return [
      ...result,
      ...await db.model('rtl')
        .whereIn('source_record_id', ids)
        .whereIn('source_field', fieldsIds)
    ];
  }, []);

  const rtlRowsMap = groupBy(rtlRows, (r) => `${r.source_record_id}-${r.source_field}`);

  await Promise.each(records, async (record) => {
    fields.forEach((field) => {
      record[field.alias] = map(rtlRowsMap[`${record.id}-${field.id}`] || [], 'target_record_id');
    });

    // redundant solution (https://redmine.nasctech.com/issues/58284#note-6)
    // ------------------------------------------------------------------------
    // await Promise.each(fields, async (field) => {
    //   const options = parseOptions(field.options);
    //   const values = map(rtlRowsMap[`${record.id}-${field.id}`] || [], 'target_record_id');
    //   const filter = compileFilter(options.filter, record);
    //   const model = options.foreign_model;
    //
    //   record[field.alias] = await filterValues(values, filter, model, sandbox);
    // });
    // ------------------------------------------------------------------------
  });

  return { records, rtlFields: fields, preloadedRTLRecords: rtlRows };
};

async function filterValues(values, filter, model, sandbox) {
  if (!values.length || !filter) return values;

  const baseScope = db.model(model).whereIn('id', values);
  const filterService = new FilterService(baseScope.model, sandbox);
  const { scope } = await filterService.apply(filter, baseScope);

  return scope.pluck('id');
}
