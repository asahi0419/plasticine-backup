import Promise from 'bluebird';
import { compact, map, find } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import fetcherFactory from '../../factory.js';

export default async (associations, fetcher, records) => {
  if (!associations) return [];

  const fields = await db.model('field')
    .where({ type: 'reference', model: fetcher.model.id })
    .whereIn('alias', map(associations, 'alias'));

  return Promise.map(fields, async (field) => {
    const options = JSON.parse(field.options);
    const ids = compact(map(records, field.alias));
    const association = find(associations, { alias: field.alias });

    const model = db.getModel(options.foreign_model);

    const params = {
      filter: ids.length ? `\`id\` IN (${ids.join(',')})` : '',
      page: false,
    };
    if (association.child) params.include = association.child;

    const result = await fetcherFactory(model, fetcher, params).fetch();
    return { model, field, result, association };
  })
};
