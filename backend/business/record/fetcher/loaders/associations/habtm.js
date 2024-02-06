import Promise from 'bluebird';
import { filter, map, find, compact } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import fetcherFactory from '../../factory.js';

export default (associations, fetcher) => {
  if (!associations) return [];
  const { rtlFields, preloadedRTLRecords } = fetcher;

  const associationAliases = map(associations, 'alias');
  const fields = filter(rtlFields, ({ alias }) => associationAliases.includes(alias));

  return Promise.map(fields, async (field) => {
    const options = JSON.parse(field.options);
    const association = find(associations, { alias: field.alias });

    const model = db.getModel(options.foreign_model);

    const rtlRecords = filter(preloadedRTLRecords, { source_field: field.id });
    const ids = compact(map(rtlRecords, 'target_record_id'));

    const params = {
      filter: ids.length ? `\`id\` IN (${ids.join(',')})` : '',
      page: false,
    };
    if (association.child) params.include = association.child;

    const result = await fetcherFactory(model, fetcher, params).fetch();

    return { model, field, result, association };
  });
};
