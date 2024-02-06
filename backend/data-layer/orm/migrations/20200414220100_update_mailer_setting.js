/* eslint-disable */

import { find } from 'lodash-es';

import * as HELPERS from './helpers/index.js';
import SEED from '../seeds/24-settings.js';
import { parseOptions } from '../../../business/helpers/index.js';

export const up = async (knex) => {
  const clause = { alias: 'mailer' };
  const seed = find(SEED.records, clause);

  const record = await HELPERS.getRecord(knex, 'setting', clause);
  if (!record) return;

  const value = JSON.stringify({ ...parseOptions(record.value), send_interval_ms: seed.value.send_interval_ms });
  await HELPERS.updateRecord(knex, 'setting', clause, { value });
};

export const down = function(knex, Promise) {
  return Promise.resolve();
};
