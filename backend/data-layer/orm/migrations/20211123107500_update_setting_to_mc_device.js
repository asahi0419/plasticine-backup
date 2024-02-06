import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async (models) => {
  await updateSetting(knex, models);
};

const updateSetting = async (knex, models) => {
  const settingModel = models.setting;
  const [ mcSettings ] = await knex(getTableName({ id: settingModel.id })).where({ alias: 'mc' });

  if (!mcSettings) return;

  const value = JSON.parse(mcSettings.value || '{}');

  return knex(getTableName({ id: settingModel.id })).where({ alias: 'mc' }).update({
    value: {
      ...value,
      default_imei_activation: false,
      default_imei_value: ''
    }
  });
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'setting' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
