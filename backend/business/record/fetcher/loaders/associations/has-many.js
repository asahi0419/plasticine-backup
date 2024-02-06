import Promise from 'bluebird';
import { filter, map, find, compact } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import fetcherFactory from '../../factory.js';

export default async (associations, fetcher, records) => {
  if (!associations) return [];
  const ids = compact(map(records, 'id'));

  const models = await db.model('model').whereIn('alias', map(associations, 'alias'));

  let fields = await db.model('field').where({ type: 'reference' }).whereIn('model', map(models, 'id'));
  fields = filter(fields, (field) => JSON.parse(field.options).foreign_model === fetcher.model.alias);

  return Promise.map(fields, async (field) => {
    const model = find(models, { id: field.model });
    const association = find(associations, { alias: model.alias });

    const params = { filter: `${field.alias} IN (${ids.join(',')})`, page: false };
    if (association.child) params.include = association.child;

    const result = await fetcherFactory(model, fetcher, params).fetch();
    return { model, field, result, association };
  });
};
