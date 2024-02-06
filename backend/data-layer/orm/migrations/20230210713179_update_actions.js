import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

export const up = async (knex) => {
  const s = await HELPERS.findSeed({ alias: 'user' });
  if (!s) return;

  const { id } = await HELPERS.getModel(knex, { alias: s.alias });
  if (!id) return;

  await Promise.each(s.actions, async ({ alias, server_script }) => {
    await HELPERS.updateRecord(knex, 'action', { model:id ,alias }, { server_script });
  });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};