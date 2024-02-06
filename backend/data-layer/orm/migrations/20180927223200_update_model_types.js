/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = (knex) => {
  return knex(getTableName({ id: 2, type: 'core' }))
    .where({ model: 1, alias: 'type' })
    .update({
      options: JSON.stringify({
        values: {
          core: 'Core',
          system: 'System',
          custom: 'Custom',
          audit: 'Audit',
          template: 'Template',
        },
      }),
    });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
