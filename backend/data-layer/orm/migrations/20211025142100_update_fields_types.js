/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = (knex) => {
  return knex(getTableName({ id: 2, type: 'core' }))
    .where({ model: 2, alias: 'type' })
    .update({
      options: JSON.stringify({
        values: {
          array_string: 'Array (string)',
          boolean: 'Boolean',
          datetime: 'Date/Time',
          integer: 'Integer',
          autonumber: 'Autonumber',
          float: 'Float',
          primary_key: 'Primary Key',
          reference: 'Reference',
          global_reference: 'Global reference',
          reference_to_list: 'Reference to list',
          string: 'String',
          journal: 'Journal',
          fa_icon: 'FA Icon',
          file: 'File',
          data_template: 'Data template',
          data_visual: 'Data visual',
          condition: 'Condition',
          filter: 'Filter',
          color: 'Color',
        },
      }),
    });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
