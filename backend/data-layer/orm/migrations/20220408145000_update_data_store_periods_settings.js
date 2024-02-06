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
    record: 'data_store_periods',
    settings: [
      'del_recs_not_inserted_after_days',
      'del_log_web_after_days',
      'del_log_background_after_days',
      'del_log_mc_days',
      'activity_log_keep_days',
      'del_planned_task_after_days',
      'del_mails_unrelated_after_days',
      'del_attachments_unrelated_after_days',
      'del_recs_mc_sync_after_days',
      'del_recs_audit_after_days'
    ]
  };
  return HELPERS.onModelExistence(knex, 'setting', migrate(knex, options));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
