/* eslint-disable */

import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelTableName = getTableName({ id: 1, type: 'core' });
const fieldTableName = getTableName({ id: 2, type: 'core' });
const rtlTableName = getTableName({ id: 10, type: 'core' });

export const up = async (knex) => {
  const [efaModel] = await knex(modelTableName).where({ alias: 'extra_fields_attribute' });
  const [stModel] = await knex(modelTableName).where({ alias: 'static_translation' });
  const [efaField] = await knex(fieldTableName).where({ alias: 'extra_attrs' });

  if (!efaModel || !efaField) return;

  const efaModelTableName = getTableName({ id: efaModel.id, type: 'core' });
  const stModelTableName = getTableName({ id: stModel.id, type: 'core' });

  const fields = await knex(fieldTableName).whereRaw(`options like '%extra_attrs%'`);

  await Promise.each(fields, async (field) => {
    const options = JSON.parse(field.options);
    await Promise.each(options.extra_attrs, async extra_attr => extra_attr && await knex(rtlTableName).insert({ source_field: efaField.id, source_record_id: field.id, target_record_id: extra_attr }));
    await knex(fieldTableName).where({ id: field.id }).update({ options: JSON.stringify({ ...options, extra_attrs: undefined }) });
  })

  await knex(stModelTableName).whereIn('key', ['no_such_extra_attribute']).delete();
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
