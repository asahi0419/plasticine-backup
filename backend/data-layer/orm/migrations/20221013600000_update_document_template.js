import Promise from 'bluebird'

import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'document_template', async (model, table) => {
    const aliases = ['js_mapping_script']

    await Promise.each(aliases, async (alias) => {
      await HELPERS.deleteRecord(knex, 'field', { model: model.id, alias });
      const column = await knex.schema.hasColumn(table, alias);
      if (column) await knex.schema.table(table, (t) => t.dropColumn(alias))
    })
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
