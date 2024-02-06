import * as HELPERS from './helpers/index.js';

const deleteRecords = async (knex, model) => {
  const modelAlias = { alias: 'email' };
  const finderAlias= { alias: 'default' };

  const m = await HELPERS.getModel(knex, { ...modelAlias });
  if (!m) return

  await HELPERS.deleteRecord(knex, model.alias, { ...finderAlias, model: m.id });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'view', async (model) => {
    await deleteRecords(knex, model);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
