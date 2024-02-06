import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateRecords = async (knex, model) => {
  const models = [
    'associated_geo_object',
    'page',
    'web_service',
    'geo_metadata',
    'incoming_emails_processing',
    'geo_object_property',
    'attachment'
  ];

  await Promise.each(models, async (alias) => {
    const s = await HELPERS.findSeed({ alias });
    if (!s) return

    const m = await HELPERS.getModel(knex, { alias: s.alias });
    if (!m) return

    await Promise.each(s[`${model.alias}s`], async (r = {}) => {
      await HELPERS.updateRecord(knex, model.alias, {
        model: m.id,
        name: r.name,
      }, {
        options: JSON.stringify(r.options || {}),
      });
    });
  });
}

const deleteRecords = async (knex, model) => {
  const models = [
    {
      alias: 'email',
      finders: [
        { name: 'Default' },
        { name: 'Outcoming' },
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
  return HELPERS.onModelExistence(knex, 'layout', async (model) => {
    await updateRecords(knex, model);
    await deleteRecords(knex, model);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
