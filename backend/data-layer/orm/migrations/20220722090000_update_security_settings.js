/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex, Promise) => {
  const [settingModel] = await knex(modelsTableName).where({ alias: 'setting' });
  if (!settingModel) return;

  const settingsTableName = getTableName({ id: settingModel.id, type: 'core' });
  const [setting] = await knex(settingsTableName).where({ alias: 'security' });
  if (!setting) return;

  const value = { ...parseOptions(setting.value), new_account_expired: false };

  return  knex(settingsTableName).where({ alias: 'security' }).update({ value: JSON.stringify(value) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
