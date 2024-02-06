/* eslint-disable */

import Promise from 'bluebird';
import { keyBy } from 'lodash-es';

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const fieldTableName = getTableName({ id: 2, type: 'core' });
const queryTypes     = ['reference', 'reference_to_list'];

export const up = async (knex) => {
  const models = await knex(modelTableName);
  const modelsMap = keyBy(models, 'id');

  const fields = await knex(fieldTableName).select('id', 'options').whereIn('type', queryTypes);

  await Promise.map(fields, (field) => {
    const options = parseOptions(field.options);

    if (options.foreign_model_id) {
      options.foreign_model = modelsMap[options.foreign_model_id].alias;
      delete options.foreign_model_id;
    }

    return knex(fieldTableName).where({ id: field.id }).update('options', JSON.stringify(options));
  });
};

export const down = (knex) => {
  return Promise.resolve();
};
