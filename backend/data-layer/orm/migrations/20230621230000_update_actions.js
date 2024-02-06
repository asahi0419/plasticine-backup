import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'action', async (model) => {
    const models = ['model', 'sandbox', 'major_model'];

    await Promise.each(models, async (alias) => {
      const s = await HELPERS.findSeed({ alias });
      if (!s) return;
      const m = await HELPERS.getModel(knex, { alias: s.alias });
      if (!m) return;

      await Promise.each(s[`${model.alias}s`], async (r = {}) => {
        await HELPERS.updateRecord(knex, model.alias, {
          model: m.id,
          alias: r.alias,
        }, {
          name: r.name,
          hint: r.hint,
          type: r.type,
          group: r.group,
          active: r.active,
          position: r.position,
          on_insert: r.on_insert,
          on_update: r.on_update,
          server_script: r.server_script,
          response_script: r.response_script,
          client_script: r.client_script,
          condition_script: r.condition_script,
          options: JSON.stringify(r.options || {}),
        });
      });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
