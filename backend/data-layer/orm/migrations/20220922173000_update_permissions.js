import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'permission', async (model) => {
    const models = [
      'document_template',
    ];

    await Promise.each(models, async (alias) => {
      const s = await HELPERS.findSeed({ alias });
      if (!s) return;
      const m = await HELPERS.getModel(knex, { alias: s.alias });
      if (!m) return;

      await Promise.each(s[`${model.alias}s`], async (r = {}) => {
        await HELPERS.deleteRecord(knex, model.alias, {
          model: m.id,
        });
      });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
