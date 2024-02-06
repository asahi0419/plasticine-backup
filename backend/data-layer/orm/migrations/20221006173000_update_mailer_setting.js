import { env } from 'process';

import * as HELPERS from './helpers/index.js';
import { parseOptions } from '../../../business/helpers/index.js';

export const up = async (knex, Promise) => {
  const clause = { alias: 'mailer' };

  const record = await HELPERS.getRecord(knex, 'setting', clause);
  if (!record) return;

  const value = parseOptions(record.value);
  if (value.incoming) return;

  const incoming = {
    auth: {
      user: env.APP_MAILER_USER,
      pass: env.APP_MAILER_PASS,
    },
    type: 'pop',
    enabled: false,
    tls: { rejectUnauthorized: false },
    port: 995,
    host: 'pop.gmail.com',
    secure: true,
    open_connection_timeout_ms: 60000,
    read_interval_ms: 60000
  };
  const newValue = {
    outgoing: value.outgoing,
    incoming,
  };

  await HELPERS.updateRecord(knex, 'setting', clause, {value: JSON.stringify(newValue)});
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
