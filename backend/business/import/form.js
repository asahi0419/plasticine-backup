import Promise from 'bluebird';
import { map, keyBy } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (records, { model, sandbox, mode }) => {
  if (records === undefined) return;

  const forms = await db.model('form').where({ model: model.id }).whereIn('alias', map(records, 'alias'));
  const formsMap = keyBy(forms, 'alias');

  return Promise.map(records, (record) => {
    if (!formsMap[record.alias]) {
      return db.model('form', sandbox)
        .createRecord({ ...record, model: model.id }, mode !== 'seeding');
    }
  });
};
