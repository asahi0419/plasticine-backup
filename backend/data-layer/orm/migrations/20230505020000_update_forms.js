import Promise from 'bluebird';
import * as HELPERS from './helpers/index.js';

const updateRecords = async (knex, model) => {
  const models = [
    'field',
    'chart',
    'account',
    'action',
    'free_geo_object',
    'associated_geo_object',
    'document_template',
    'form',
    'page',
    'web_service',
    'geo_metadata',
    'json_translation',
    'model',
    'email',
    'incoming_emails_processing',
    'geo_object_property',
    'user',
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
        alias: r.alias,
      }, {
        options: JSON.stringify(r.options || {}),
        condition_script: r.condition_script
      });
    });
  });
}

const deleteRecords = async (knex, model) => {
  const models = [

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
  return HELPERS.onModelExistence(knex, 'form', async (model) => {
    await updateRecords(knex, model)
    await deleteRecords(knex, model)
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
