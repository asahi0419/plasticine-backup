/* eslint-disable */

import Promise from 'bluebird';
import { isNumber } from 'lodash-es';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });
const viewsTableName = getTableName({ id: 5, type: 'core' });

export const up = async (knex) => {
  const fields = await knex(fieldsTableName).whereIn('type', ['reference', 'reference_to_list']);

  await Promise.each(fields, async ({ id, options }) => {
    options = JSON.parse(options);

    if (isNumber(options.foreign_model)) {
      const [ model = {} ] = await knex(modelsTableName).where({ id: options.foreign_model }) || [];
      options.foreign_model = model.alias;
    }

    if (isNumber(options.view)) {
      const [ view = {} ] = await knex(viewsTableName).where({ id: options.view }) || [];
      options.view = view.alias;
    }

    await knex(fieldsTableName).where({ id }).update({ options: JSON.stringify(options) });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
