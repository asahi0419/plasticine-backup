import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateRecords = async (knex, model) => {
  const modelAlias = 'email'

  const s = await HELPERS.findSeed({ alias: modelAlias });
  if (!s) return;

  const m = await HELPERS.getModel(knex, { alias: s.alias });
  if (!m) return;

  await Promise.each(s[`${model.alias}s`], async (r = {}) => {
    await HELPERS.updateRecord(knex, model.alias, {
      model: m.id,
      alias: r.alias,
    }, {
      name: r.name,
      condition_script: r.condition_script,
    });
  });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'view', async (model) => {
    await updateRecords(knex, model);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};