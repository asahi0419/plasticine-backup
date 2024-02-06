import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'privilege', async (model) => {
    const models = [
      'free_geo_object',
      'associated_geo_object',
      'geo_object_property',
    ];

    await Promise.each(models, async (alias) => {
      const model = await HELPERS.getModel(knex, { alias });
      model && await HELPERS.deleteRecord(knex, 'privilege', { model: model.id })
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
