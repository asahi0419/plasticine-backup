/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const layoutTableName = getTableName({ id: 9, type: 'core' });

const DEFAULT_T_CROSS_LAYOUT = {
  columns: [
    'id',
    'dtf_field_id',
    'dtf_record_id',
    'data_model_id',
    'data_record_id',
    'dvf_field_id',
    'dvf_record_id',
    'created_at',
    'created_by',
    'updated_at',
    'updated_by',
  ],
  columns_options: {},
  sort_order: [
    { field: 'id', type: 'descending' },
    { field: 'dtf_field_id', type: 'none' },
    { field: 'dtf_record_id', type: 'none' },
    { field: 'data_model_id', type: 'none' },
    { field: 'data_record_id', type: 'none' },
    { field: 'dvf_field_id', type: 'none' },
    { field: 'dvf_record_id', type: 'none' },
    { field: 'created_at', type: 'none' },
    { field: 'created_by', type: 'none' },
    { field: 'updated_at', type: 'none' },
    { field: 'updated_by', type: 'none' },
  ],
  wrap_text: false,
  cell_editing: false,
};

export const up = async (knex) => {
  const [ tCrossModel ] = await knex(modelTableName).where({ alias: 't_cross' }).limit(1);

  return tCrossModel
    ? knex(layoutTableName).where({ model: tCrossModel.id, name: 'Default' }).update({ options: JSON.stringify(DEFAULT_T_CROSS_LAYOUT) })
    : Promise.resolve();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
