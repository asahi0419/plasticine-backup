/* eslint-disable */

import Promise from 'bluebird';
import { omit } from 'lodash-es';

import getTableName from './helpers/table-name.js';

const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const fields = await knex(fieldsTableName).whereIn('type', ['reference', 'reference_to_list']);

  return Promise.map(fields, ({ id, options }) => {
    options = JSON.parse(options);
    if (!options.foreign_view) return;
    options = JSON.stringify({ ...omit(options, ['foreign_view']), view: options.foreign_view });
    return knex(fieldsTableName).where({ id }).update({ options });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
