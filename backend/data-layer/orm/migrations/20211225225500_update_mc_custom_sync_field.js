import * as HELPERS from './helpers/index.js';

const migrate = knex => async models => {
  const { field, mc_custom_sync } = models;
  const conditionField = await HELPERS.getRecord(knex, field.alias, {
    model: mc_custom_sync.id,
    alias: 'condition'
  });

  if (conditionField.required_when_script) {
    await HELPERS.updateRecord(knex, field.alias, {
      model: mc_custom_sync.id,
      alias: 'condition'
    }, { required_when_script: null });
  }
};

export const up = (knex) => {
  return HELPERS.onModelsExistence(knex, [ 'mc_custom_sync', 'field' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
