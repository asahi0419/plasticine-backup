/* eslint-disable */

import Promise from 'bluebird';
import { isString } from 'lodash-es';

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const fields = await  knex(fieldsTableName).where('options', 'like', `%"sync_to"%`);

  await Promise.each(fields, async (field) => {
    const options = parseOptions(field.options);
    if (!options.sync_to || !isString(options.sync_to)) return;

    let foreignModelId = options.foreign_model;
    if (isString(options.foreign_model)) {
      const [foreignModel] = await knex(modelsTableName).where({ alias: options.foreign_model });
      if (foreignModel) foreignModelId = foreignModel.id;
    }

    const [syncToField] = await knex(fieldsTableName).where({ model: foreignModelId, type: 'reference_to_list', alias: options.sync_to });
    if (!syncToField) return;

    await knex(fieldsTableName).where({ id: field.id }).update({ options: JSON.stringify({ ...options, sync_to: syncToField.id }) });
  })
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
