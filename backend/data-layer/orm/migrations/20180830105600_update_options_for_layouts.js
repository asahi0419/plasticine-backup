/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';
import { parseOptions } from '../../../business/helpers/index.js';

const layoutTableName = getTableName({ id: 9, type: 'core' });

export const up = async (knex) => {
  const layouts = await knex(layoutTableName).select('id', 'options');

  await Promise.map(layouts, (layout) => {
    const options = parseOptions(layout.options);
    delete options.cell_editing;
    options.no_wrap_text_limit = 50;
    return knex(layoutTableName).where({ id: layout.id }).update('options', JSON.stringify(options));
  });
};

export const down = (knex) => {
  return Promise.resolve();
};
