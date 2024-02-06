import Promise from 'bluebird';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

async function createFields(knex) {
  const m = await HELPERS.getRecord(knex, 'model', { alias: 'appearance' });
  const f = await HELPERS.getRecord(knex, 'field', { model: m.id, alias: 'geo_metadata' });

  if (f) {
    await HELPERS.updateRecord(knex, 'field', {
      model: m.id,
      alias: 'geo_metadata',
    }, {
      virtual: false,
    });

    return;
  }

  await HELPERS.createRecord(knex, 'field', {
    model: m.id,
    name: 'Geo metadata',
    alias: 'geo_metadata',
    type: 'reference_to_list',
    virtual: false,
    options: JSON.stringify({
      foreign_model: 'geo_metadata',
      foreign_label: 'name',
    }),
    __lock: ['delete'],
  });
}

async function createValues(knex) {
  const m = await HELPERS.getRecord(knex, 'model', { alias: 'appearance' });
  const f = await HELPERS.getRecord(knex, 'field', { model: m.id, alias: 'geo_metadata' });

  const appearances = await HELPERS.getRecords(knex, 'appearance', { type: 'map' });
  await Promise.each(appearances, async (a) => {
    const { geo_metadata = [] } = parseOptions(a.options);

    await Promise.each(geo_metadata, async (alias) => {
      const record = await HELPERS.getRecord(knex, 'geo_metadata', { alias });
      if (!record) return;

      await HELPERS.createRecord(knex, 'rtl', {
        source_field: f.id,
        source_record_id: a.id,
        target_record_id: record.id,
      });
    });
  }, []);
}

export const up = (knex) => {
  return HELPERS.onModelsExistence(knex, ['appearance', 'geo_metadata'], async () => {
    const field = await createFields(knex);
    if (field) await createValues(knex);
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
