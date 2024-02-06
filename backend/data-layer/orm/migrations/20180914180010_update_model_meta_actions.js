/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const actionsTableName = getTableName({ id: 5, type: 'core' });

const NEW_ACTION_ATTRIBUTES = [
  { alias: 'fields', attributes: { position: '1000' } },
  { alias: 'actions', attributes: { position: '990' } },
  { alias: 'forms', attributes: { position: '980' } },
  { alias: 'db_rule', attributes: { position: '970' } },
  { alias: 'ui_rule', attributes: { position: '960' } },
  { alias: 'views', attributes: { position: '950' } },
  { alias: 'layouts', attributes: { position: '940' } },
  { alias: 'appearances', attributes: { position: '930' } },
  { alias: 'filters', attributes: { position: '910' } },
  { alias: 'permissions', attributes: { position: '900' } },
  { alias: 'privileges', attributes: { position: '890' } },
];

export const up = knex => Promise.each(NEW_ACTION_ATTRIBUTES, ({ alias, attributes }) =>
  knex(actionsTableName).where({ model: 1, alias }).update({ ...attributes, options: JSON.stringify({ group: 'meta' }) }));

export const down = (knex, Promise) => {
  return Promise.resolve();
};