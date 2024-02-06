/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const migrateViews = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'view',
    { alias: 'background', model: models.log.id },
  );
  await HELPERS.updateRecord(knex, 'view',
    { alias: 'default', model: models.log.id },
    { order: 400 }
  );
};

const migrateFilters = async (knex, models) => {
  await HELPERS.deleteRecord(knex, 'filter',
    { name: 'Background', model: models.log.id },
  );
};

const migrateRecords = async (knex, models) => {
  const table = await HELPERS.getModelTableName(knex, 'log');
  const operator = (process.env.DB_TYPE === 'mysql') ? 'like' : 'ilike';

  await knex(table).whereNot('domain', 'web').update({ domain: 'background_tasks' });
  await knex(table).whereNot('domain', 'web').andWhere('message', operator, '%email%').update({ domain: 'background_mails' });
};

const migrate = (knex) => async (models) => {
  await migrateViews(knex, models);
  await migrateFilters(knex, models);
  await migrateRecords(knex, models);
};

export const up = (knex) => {
  const models = ['model', 'view', 'filter', 'log'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
