/* eslint-disable */

import Promise from 'bluebird';
import { pick } from 'lodash-es';

import { onModelExistence } from './helpers/index.js';

const migrate = (knex) => async (model, table) => {
  const records = await knex(table).where({ type: 'sidebar_container' });

  await Promise.each(records, async (record) => {
    const attributes = { ...pick(record, ['user', 'model', 'record_id']), type: 'system_sidebar' }
    const { collapsedItems = [], favoriteItems = [] } = JSON.parse(record.options || JSON.stringify({}));

    const isConfigured = collapsedItems.length || favoriteItems.length;
    const isDuplicated = await knex(table).where(attributes);

    if (isDuplicated) {
      if (isConfigured) {
        await knex(table).where(attributes).delete();
      } else {
        await knex(table).where({ id: record.id }).delete();
      }
    }
  });

  await knex(table).where({ type: 'system_sidebar' }).update({ type: 'sidebar_container' });
}

export const up = (knex) => {
  return onModelExistence(knex, 'user_setting', migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
