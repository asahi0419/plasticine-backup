import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'permission', async (model) => {
    const models = ['json_translation'];

    await Promise.each(models, async (alias) => {
      const s = await HELPERS.findSeed({ alias });
      if (!s) return;
      const m = await HELPERS.getModel(knex, { alias: s.alias });
      if (!m) return;

      await Promise.each(s[`${model.alias}s`], async (r = {}) => {
          await HELPERS.updateRecord(knex, model.alias, {
            model: m.id,
            action: r.action,
          }, {
            script: r.script,
          });
      });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
