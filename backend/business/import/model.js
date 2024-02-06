import db from '../../data-layer/orm/index.js';
import { parseOptions } from '../helpers/index.js';

export default async (attributes, { sandbox, mode }) => {
  const date = new Date();

  const model = await db.model('model').where({ alias: attributes.alias }).getOne();
  const manager = await db.model('model', sandbox).getManager(mode !== 'seeding');

  const options = parseOptions(attributes.options);

  if (mode === 'seeding') {
    if (options.seeded_at) return;
    options.seeded_at = date;
  }

  attributes.options = {
    ...parseOptions((model || {}).options),
    ...options,
    templated_at: date,
    ex_save: { protectSystemFields: true }
  };
  attributes.versionable_attachments = attributes.versionable_attachments || false;

  return model ? manager.update(model, attributes) : manager.create(attributes);
}
