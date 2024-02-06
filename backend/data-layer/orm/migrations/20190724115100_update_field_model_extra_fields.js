/* eslint-disable */

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const extraFieldsIds = await knex(fieldsTableName).pluck('id').whereIn('alias', ['type', 'alias']).where({ model: 1 });
  if (!extraFieldsIds.length) return;

  const [field] = await knex(fieldsTableName).where({ alias: 'model', model: 2 });
  if (!field) return;

  const options = { ...parseOptions(field.options), extra_fields: extraFieldsIds };
  return knex(fieldsTableName).where({ id: field.id }).update({ options: JSON.stringify(options) });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
