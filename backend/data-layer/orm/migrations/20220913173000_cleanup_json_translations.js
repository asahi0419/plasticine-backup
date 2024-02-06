import lodash from 'lodash-es';
import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';

export const up = (knex) => {
  return HELPERS.onModelExistence(knex, 'json_translation', async () => {
    const translations = await HELPERS.getRecords(knex, 'json_translation');

    await Promise.each(translations, async (translation = {}) => {
      const model = await HELPERS.getRecord(knex, 'model', { id: translation.model })
      if (!model) return HELPERS.deleteRecord(knex, 'json_translation', { id: translation.id })

      const field = await HELPERS.getRecord(knex, 'field', { id: translation.field })
      if (!field) return HELPERS.deleteRecord(knex, 'json_translation', { id: translation.id })

      const record = await HELPERS.getRecord(knex, model.alias, { id: translation.record_id })
      if (!record) return HELPERS.deleteRecord(knex, 'json_translation', { id: translation.id })

      try {
        const value = lodash.get(JSON.parse(record[field.alias] || '{}'), translation.path.split('/'))
        if (!value) return HELPERS.deleteRecord(knex, 'json_translation', { id: translation.id })
      } catch (error) {

      }
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
