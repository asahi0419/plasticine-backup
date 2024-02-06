/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const condition_script = `if ((p.this.getType() === 'form') && (p.this.getExecType() === 'attachment_view')) {
  return p.currentUser.canDeleteAttachment();
} else {
  return p.currentUser.canDelete();
}`;

  await knex(table).where({ alias: 'list_delete', type: 'view_choice' }).update({ condition_script });
};

export const up = (knex) => {
  return onModelExistence(knex, 'action', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
