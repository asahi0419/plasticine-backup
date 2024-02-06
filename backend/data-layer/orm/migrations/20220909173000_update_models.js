import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'model', async () => {
    const models = await HELPERS.getRecords(knex, 'model', { type: 'core' });

    await Promise.each(models, async (model = {}) => {
      const seed = await HELPERS.findSeed({ alias: model.alias });

      if (seed) {
        await HELPERS.updateRecord(knex, 'model', {
          alias: model.alias,
        }, {
          plural: seed.plural
        });
      }
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
