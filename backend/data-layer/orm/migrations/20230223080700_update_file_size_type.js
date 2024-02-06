import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

const migrate = (knex) => async (models) => {
  const field = await HELPERS.getRecord(knex, 'field', { model: models.attachment.id, alias: 'file_size' });
  if (!field) return;
  const newType = `integer`;

  await HELPERS.updateRecord(knex, 'field',
      { id: field.id },
      { type: newType });
  const modelTableName = await HELPERS.getModelTableName(knex, 'attachment');
  await knex.raw(`ALTER TABLE "${modelTableName}" ALTER COLUMN "file_size" TYPE ${newType}`);
};

export const up = (knex) => {
  const models = ['attachment', 'field'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};

