/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const fields = await knex(fieldsTableName).where({ type: 'data_template' });

  return Promise.each(fields, async ({ id, options: oldOptions }) => {
    const options = JSON.stringify({
      ...JSON.parse(oldOptions),
      show_fields: {
        folder: true,
        check: true,
        text: true,
        float: true,
        int: true,
        date: true,
        datetime: true,
        options: true,
        media: true,
      },
    })

    return knex(fieldsTableName).where({ id }).update({ options });
  });
}

export const down = (knex, Promise) => {
  return Promise.resolve();
};
