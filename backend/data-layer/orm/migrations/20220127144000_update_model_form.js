import getTableName from './helpers/table-name.js';
import SEED from '../seeds/01-models.js';
import * as HELPERS from './helpers/index.js';

const migrate = knex => async (models) => {
  const { model, form } = models;
  const [ formSeed ] = SEED.forms;

  const [ modelForm ] = await knex(getTableName({ id: form.id })).where({ model: 1, alias: 'default' });
  if (!modelForm) return;

  const formOptions = JSON.parse(modelForm.options);

  await knex(getTableName({ id: form.id })).update({
    options: {
      ...formOptions,
      components: { ...formOptions.components, list: formSeed.options.components.list },
    }
  }).where({ id: model.id, alias: 'default' });
};

export const up = (knex) => {
  return HELPERS.onModelsExistence(knex, [ 'model', 'form' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
