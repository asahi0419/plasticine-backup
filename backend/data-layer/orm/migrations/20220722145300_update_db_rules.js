/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const SCRIPT = `if (p.action === 'create') {
  p.record.setValue('last_password_change', new Date());
}

if (p.record.isChanged('password')) {
  p.record.setValue('last_password_change', new Date());

  if (p.record.getValue('status') === 'expired') {
    p.record.setValue('status', 'active');
  }
}

if (p.action === 'create' && p.getSetting('security.new_account_expired') && (p.record.getValue('status') === 'active')) {
    p.record.setValue('status', 'expired');
}`;

const migrate = (knex) => async (model, table) => {
    await knex(table).where({ name: 'Process last password change' }).update({ script: SCRIPT });
}

export const up = (knex) => {
    return onModelExistence(knex, 'db_rule', migrate(knex));
};

export const down = (knex, Promise) => {
    return Promise.resolve();
};
