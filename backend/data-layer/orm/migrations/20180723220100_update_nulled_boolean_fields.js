/* eslint-disable */

import db from '../index.js';
import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const fieldTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex, Promise) => {
  const models = await knex(modelTableName);

  return models.map(async (model) => {
    const tableName = getTableName({ id: model.id });
    const fields = await knex(fieldTableName).where({ model: model.id, type: 'boolean', virtual: false });

    if (fields.length) {
      await fields.map(field => db.client.setBooleanDefault(tableName, field.alias, false));
      await fields.map(field => knex(tableName).where({ [field.alias]: null }).update({ [field.alias]: false }));
    }
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
