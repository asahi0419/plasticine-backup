import { isObject } from 'lodash-es';

import { onModelExistence } from './helpers/index.js';

const migrateSettings = (knex) => async (model, table) => {
  const clause = { alias: 'authorization' };
  const [ authSettings ] = await knex(table).where(clause);

  if (!authSettings || !isObject(authSettings)) return;

  const editedAuthSettings = editAuthSettings(JSON.parse(authSettings.value));
  await knex(table).where(clause).update({ value: editedAuthSettings });
};

const editAuthSettings = (authSettings) => {
  const password = {};

  password.recovery = authSettings.allow_change_password;
  password.min_length = authSettings.password_min_length;
  password.max_length = authSettings.password_max_length;

  delete authSettings.allow_change_password;
  delete authSettings.password_min_length;
  delete authSettings.password_max_length;

  authSettings.password = password;

  return authSettings;
};

export const up = async (knex) => {
  await onModelExistence(knex, 'setting', migrateSettings(knex));
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
