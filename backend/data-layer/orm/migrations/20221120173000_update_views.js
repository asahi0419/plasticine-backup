import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateRecords = async (knex, model) => {
  const models = [
    'free_geo_object',
    'associated_geo_object',
    'geo_object_property',
    'document_template',
    'json_translation',
  ];

  await Promise.each(models, async (alias) => {
    const s = await HELPERS.findSeed({ alias });
    if (!s) return;

    const m = await HELPERS.getModel(knex, { alias: s.alias });
    if (!m) return

    await Promise.each(s[`${model.alias}s`], async (r = {}) => {
      await HELPERS.updateRecord(knex, model.alias, {
        model: m.id,
        alias: r.alias,
      }, {
        name: r.name,
        condition_script: r.condition_script,
      });
    });
  });
}

const deleteRecords = async (knex, model) => {
  const models = [
    {
      alias: 'email',
      finders: [
        { alias: 'default' },
        { alias: 'outcoming' },
        { alias: 'incoming' },
        { alias: 'outgoing' },
      ]
    }
  ];

  await Promise.each(models, async ({ alias, finders }) => {
    const m = await HELPERS.getModel(knex, { alias });
    if (!m) return

    await Promise.each(finders, async (finder = {}) => {
      await HELPERS.deleteRecord(knex, model.alias, { ...finder, model: m.id });
    });
  });
}

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'view', async (model) => {
    await updateRecords(knex, model);
    await deleteRecords(knex, model);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
