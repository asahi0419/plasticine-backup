import Promise from 'bluebird';
import { map, filter } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import * as Security from '../../../security/index.js';
import Selector from '../selector.js';

export default async (rows, fetcher) => {
  const { count = '', count_filters = {} } = fetcher.params;
  if (!count) return rows;

  const countModels = await Promise.filter(count.split(','), (modelAlias) => {
    const model = db.getModel(modelAlias);
    return Security.checkAccess('model', model, fetcher.sandbox);
  });
  if (!countModels.length) return rows;

  const models = await db.model('model').whereIn('alias', countModels).select(['id', 'alias']);
  const fields = await db.model('field').whereIn('model', map(models, 'id')).andWhere('type', 'global_reference').select(['id', 'alias', 'model']);
  const records = await db.model('global_references_cross')
    .whereIn('source_field', map(fields, 'id'))
    .whereIn('target_record_id', map(rows, 'id'))
    .where({ target_model: fetcher.model.id })
    .select(['source_field', 'source_record_id', 'target_record_id']);

  await Promise.each(rows, async (row) => {
    let crossRecords = filter(records, { target_record_id: row.id });
    row.__counts = {};

    await Promise.each(fields, async (field) => {
      const model = db.getModel(field.model);
      
      if (crossRecords.length && count_filters[model.alias]) {
        const query = `(${count_filters[model.alias]}) AND (id IN (${map(crossRecords, 'source_record_id')}))`
        const result = await new Selector(model, fetcher.sandbox, { select: 'id' }).fetch(query);
        crossRecords = filter(crossRecords, ({ source_record_id }) => map(result, 'id').includes(source_record_id));
      }

      row.__counts[model.alias] = filter(crossRecords, { source_field: field.id }).length;
    });
  });

  return rows;
};
