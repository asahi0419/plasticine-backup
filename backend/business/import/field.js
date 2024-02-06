import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const fields = await db.model('field').where({ model: model.id }).whereIn('alias', map(records, 'alias'));
  const fieldsMap = keyBy(fields, 'alias');

  return Promise.map(records, (record) => {
    if (!fieldsMap[record.alias]) {
      return db.model('field', sandbox)
        .createRecord({ index: 'none', virtual: false, ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
