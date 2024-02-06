/* eslint-disable */

import * as HELPERS from './helpers/index.js';

const SCRIPT = `const minutes = 360;
const now = new Date();
const limit = new Date(now - minutes * 60 * 1000);

try {
  const model = await p.getModel('ip_ban');
  const count = await model.find({ updated_at: { '<': limit }, ban_till: { '<': now } })
                         .orFind({ created_at: { '<': limit }, ban_till: { '<': now } })
                         .orFind({ updated_at: { '<': limit }, ban_till: null })
                         .orFind({ created_at: { '<': limit }, ban_till: null })
                         .delete();

  p.log.info(\`Cleanup old ip bans (\${count} ip bans)\`);
} catch (error) {
  p.log.error(error);
}`;

export const up = async (knex) => {
  await HELPERS.updateRecord(knex, 'scheduled_task',
    { name: 'Ip Ban cleaner' },
    { script: SCRIPT }
  );
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
