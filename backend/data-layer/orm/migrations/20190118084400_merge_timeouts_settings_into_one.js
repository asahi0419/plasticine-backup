/* eslint-disable */

import { keyBy } from 'lodash-es';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex, Promise) => {
  const [settingModel] = await knex(modelsTableName).where({ alias: 'setting' });
  if (!settingModel) return;

  const settingsTableName = getTableName({ id: settingModel.id, type: 'core' });
  const settings = await knex(settingsTableName).where('alias', 'like', '%_timeout');
  if (!settings.length) return;

  const settingsMap = keyBy(settings, 'alias');

  await knex(settingsTableName).insert({
    group: 'core',
    name: 'Timeout',
    alias: 'timeout',
    value: JSON.stringify({
      default: settingsMap.script_timeout.value,
      action: settingsMap.script_action_timeout.value,
      db_rule: settingsMap.script_db_rule_timeout.value,
      escalation_rule: settingsMap.script_escalation_rule_timeout.value,
      web_service: settingsMap.script_web_service_timeout.value,
      web_socket: settingsMap.script_web_socket_timeout.value,
    }),
    description: 'Timeouts for scripts execution',
  });

  await knex(settingsTableName).where('alias', 'like', '%_timeout').del();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
