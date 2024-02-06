import { map, filter, isArray, isEmpty } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { worklogDBModel, worklogIsExist } from '../../../worklog/model.js';

export default async (records, model, options = {}) => {
  records = filter(records, (r) => !isEmpty(r) && r.id);

  let fields = db.getFields({ model: model.id, type: 'journal' });
  if (isArray(options.fieldset) && options.fieldset.length) {
    fields = filter(fields, ({ alias }) => options.fieldset.includes(alias));
  }

  if (!fields.length) return { records };

  const worklog = worklogIsExist(model)
  if (!worklog) return { records };

  const worklogRows = await worklogDBModel(model)
    .whereIn('related_field', map(fields, 'id'))
    .whereIn('related_record', map(records, 'id'))
    .select('id');

  if (worklogRows.length)  {
    records.forEach((record) => {
      fields.forEach((field) => {
        record[field.alias] = map(worklogRows, 'id');
      });
    });
  }

  return { records, journalFields: fields, preloadedJournalRecords: worklogRows };
};
