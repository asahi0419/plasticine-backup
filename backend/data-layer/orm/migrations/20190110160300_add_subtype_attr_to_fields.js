/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  await setRefModel('field', 'required_when_script', knex);
  await setRefModel('field', 'hidden_when_script', knex);
  await setRefModel('field', 'readonly_when_script', knex);
  await setRefModel('action', 'condition_script', knex);
  await setRefModel('db_rule', 'condition_script', knex);
  await setRefModel('form', 'condition_script', knex);
  await setRefModel('permission', 'script', knex);
  await setRefModel('escalation_rule', 'condition_script', knex);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

async function setRefModel(modelAlias, fieldAlias, knex) {
  const [ model ] = await knex(modelsTableName).where({ alias: modelAlias }).limit(1);
  if (!model) return;

  return knex(fieldsTableName)
    .where({ model: model.id, alias: fieldAlias })
    .update({ options: JSON.stringify({ ref_model: 'model', length: 150000, syntax_hl: 'js' }) });
}
