/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex, Promise) => {
  const [settingModel] = await knex(modelsTableName).where({ alias: 'setting' });
  if (!settingModel) return;

  const settingsTableName = getTableName({ id: settingModel.id, type: 'core' });
  const [setting] = await knex(settingsTableName).where({ alias: 'limits' });
  if (!setting) return;

  const value = { ...parseOptions(setting.value), export_records_max: 10000 };

  return knex(settingsTableName).where({ alias: 'limits' }).update({ value: JSON.stringify(value) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
