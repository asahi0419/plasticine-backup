import { isUndefined, find, each } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEEDS from '../seeds/settings/index.js';

const migrate = (knex, options) => async (model) => {
  const settingRecord = await HELPERS.getRecord(knex, model.alias, { alias: options.record });
  if (!settingRecord) return;

  const mcSettings = JSON.parse(settingRecord.value || '{}');
  const seed = find(SEEDS, { alias: options.record }).value;

  each(options.settings, setting => {
    if (isUndefined(mcSettings[setting])) {
      mcSettings[setting] = seed[setting];
    }
  });


  await HELPERS.updateRecord(knex, model.alias, { alias: options.record }, { value: mcSettings });
};

export const up = (knex) => {
  const options = {
    record: 'mc',
    settings: [
      'auto_update_version_code_ios',
      'auto_update_version_name_ios'
    ]
  };
  return HELPERS.onModelExistence(knex, 'setting', migrate(knex, options));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
