import Promise from 'bluebird';
import { filter, map } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export default async (attributes, model, fields, sandbox) => {
  if (!sandbox.user) return;
  if (!sandbox.user.language) return;

  const translatableFields = filter(fields, { __translated: true });
  if (!translatableFields.length) return;

  const translations = sandbox.translate({ ...attributes }, model.alias, map(translatableFields, 'alias'));

  return Promise.map(translatableFields, async (field) => {
    if (attributes[field.alias] !== translations[field.alias]) {
      const rec = await db.model('dynamic_translation')
        .where({ model: model.id, field: field.id, record_id: attributes.id }).getOne();
      await db.model('dynamic_translation', sandbox).updateRecord(rec, { [sandbox.user.language.alias]: attributes[field.alias] });
    }
  });
};
