/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const formTableName = getTableName({ id: 11, type: 'core' });

const DEFAULT_T_CROSS_FORM = {
  components: {
    list: [
      '__tab__.main',
      '__section__.1',
      '__column__.1_1',
      'dtf_field_id',
      'dtf_record_id',
      'data_model_id',
      'data_record_id',
      'dvf_field_id',
      'dvf_record_id',
      '__tab__.service',
      '__section__.3',
      'id',
      '__section__.4',
      '__column__.4_1',
      'created_at',
      'updated_at',
      '__column__.4_2',
      'created_by',
      'updated_by',
    ],
    options: {
      '__tab__.main': { expanded: true, name: 'Main' },
      '__tab__.service': { name: 'Service' },
    },
    label_position: 'left',
  },
  related_components: { list: [], show_as_tabs: true },
};

export const up = async (knex) => {
  const [ tCrossModel ] = await knex(modelTableName).where({ alias: 't_cross' }).limit(1);

  return tCrossModel
    ? knex(formTableName).where({ model: tCrossModel.id, alias: 'default' }).update({ options: JSON.stringify(DEFAULT_T_CROSS_FORM) })
    : Promise.resolve();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
