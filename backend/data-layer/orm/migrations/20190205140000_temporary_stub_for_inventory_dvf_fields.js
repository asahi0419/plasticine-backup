/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const templateModelIds = await knex(modelsTableName).pluck('id').where({ type: 'template' });
  if (!templateModelIds.length) return;

  await updateFieldSubtype(templateModelIds, 'inventory', knex);
  await updateFieldSubtype(templateModelIds, 'subcategory', knex);
  await updateFieldSubtype(templateModelIds, 'unit', knex);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};

async function updateFieldSubtype(templateModelIds, subtype, knex) {
  const fields = await  knex(fieldsTableName).whereIn('model', templateModelIds)
    .where('alias', 'like', `${subtype}_%`)
    .orWhere('alias', subtype);

  await Promise.each(fields, async (field) => {
    const options = JSON.parse(field.options || '{}');
    await knex(fieldsTableName).where({ id: field.id }).update({ type: 'string' });
  })
}