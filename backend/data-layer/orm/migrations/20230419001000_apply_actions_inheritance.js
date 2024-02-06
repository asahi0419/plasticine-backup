import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateFields = async (knex) => {
  const model = await HELPERS.getRecord(knex, 'model', { alias: 'field' });

  await Promise.each(['model', 'action'], async (alias) => {
    const s = await HELPERS.findSeed({ alias });
    const m = await HELPERS.getModel(knex, { alias: s.alias });
  
    await Promise.each(s[`${model.alias}s`], async (r = {}) => {
      await HELPERS.updateRecord(knex, model.alias, {
        model: m.id,
        alias: r.alias,
      }, {
        hidden_when_script: r.hidden_when_script,
        options: JSON.stringify(r.options || {}),
      });
    });
  });
};

const updateActions = async (knex) => {
  const model = await HELPERS.getRecord(knex, 'model', { alias: 'action' });
  
  const s = await HELPERS.findSeed({ alias: 'major_model' });
  const m = await HELPERS.getModel(knex, { alias: s.alias });

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
      client_script: r.client_script,
      condition_script: r.condition_script,
      options: JSON.stringify(r.options || {}),
    });
  });
};

export const up = async (knex) => {
  await updateFields(knex);
  await updateActions(knex);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
