/* eslint-disable */

import Promise from 'bluebird';
import { each } from 'lodash-es';

import * as HELPERS from './helpers/index.js';

const ALIASES = [
  { prev: 'inventory_models', curr: 'plugin_inventory' },
  { prev: 'odbc_interface',   curr: 'plugin_odbc'      },
  { prev: 'telegram_bots',    curr: 'plugin_telegram'  },
];

export const up = async (knex) => {
  await Promise.each(ALIASES, async ({ prev, curr }) => {
    const record = await HELPERS.getRecord(knex, 'plugin', { alias: prev });
    if (!record) return;

    await HELPERS.updateRecord(knex, 'plugin', { alias: prev }, { alias: curr, status: 'active' });

    const setting = await HELPERS.getRecord(knex, 'setting', { alias: 'extensions' });
    if (!setting) return;

    const value = JSON.parse(setting.value);
    each(value.plugins, (plugin, i) => {
      if (plugin.alias === curr) plugin.active = true;
    });
    await HELPERS.updateRecord(knex, 'setting', { alias: 'extensions' }, { value: JSON.stringify(value) });
  });

};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
