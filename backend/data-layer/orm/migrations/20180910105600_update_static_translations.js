/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex, Promise) => {
  const [stModel] = await knex(modelsTableName).where({ alias: 'static_translation' });
  if (!stModel) return;

  const stTableName = getTableName({ id: stModel.id, type: 'core' });
  const scope = knex(stTableName).where({ key: 'db_rule_script_error' });
  const [isKeyExist] = await scope;

  return !isKeyExist && await scope.update({ key: 'd_b_rule_script_error' });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
