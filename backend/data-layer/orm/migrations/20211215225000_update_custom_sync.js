import { onModelsExistence } from './helpers/index.js';

import getTableName from './helpers/table-name.js';
import SEED from '../seeds/50-custom_sync.js';

const migrate = (knex) => async (models) => {
  await knex(getTableName({ id: models.layout.id }))
    .where({ model: models.mc_custom_sync.id, name: 'Default' })
    .update({ options: SEED.layouts[0].options });

  await knex(getTableName({ id: models.form.id }))
    .where({ model: models.mc_custom_sync.id, alias: 'default' })
    .update({ options: SEED.forms[0].options });
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'layout', 'form', 'mc_custom_sync' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
