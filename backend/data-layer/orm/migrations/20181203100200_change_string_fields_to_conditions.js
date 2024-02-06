/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  await updateFieldType('model', 'access_script', knex);
  await updateFieldType('field', 'required_when_script', knex);
  await updateFieldType('field', 'hidden_when_script', knex);
  await updateFieldType('field', 'readonly_when_script', knex);
  await updateFieldType('action', 'condition_script', knex);
  await updateFieldType('page', 'access_script', knex);
  await updateFieldType('db_rule', 'condition_script', knex);
  await updateFieldType('view', 'condition_script', knex);
  await updateFieldType('form', 'condition_script', knex);
  await updateFieldType('permission', 'script', knex);
  await updateFieldType('escalation_rule', 'condition_script', knex);
  await updateFieldType('web_service', 'access_script', knex);
  await updateFieldType('web_socket', 'access_script', knex);
  await updateFieldType('user_sidebar', 'condition_script', knex);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

async function updateFieldType(modelAlias, fieldAlias, knex) {
  const [ model ] = await knex(modelsTableName).where({ alias: modelAlias }).limit(1);
  if (!model) return;

  return knex(fieldsTableName)
    .where({ model: model.id, alias: fieldAlias })
    .update({ type: 'condition' });
}
