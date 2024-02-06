import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateRecords = async (knex, model) => {

  const s = await HELPERS.findSeed({ alias: 'account' } );
  if (!s) return;

  const m = await HELPERS.getModel(knex, { alias: s.alias });
  if (!m) return;

  await Promise.each(s[`${model.alias}s`], async (r = {}) => {
    await HELPERS.updateRecord(knex, model.alias, {
      model: m.id,
      alias: r.alias,
    }, {
      name: r.name,
      index: r.index,
      options: JSON.stringify(r.options || {}),
      hidden_when_script: r.hidden_when_script || null,
      readonly_when_script: r.readonly_when_script || null,
      required_when_script: r.required_when_script || null,
    });
  });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'field', async (model) => {
    await updateRecords(knex, model);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};