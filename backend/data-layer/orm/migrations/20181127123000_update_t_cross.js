/* eslint-disable */
import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });
const fieldsTableName = getTableName({ id: 2, type: 'core' });

export const up = async (knex) => {
  const [tCrossModel] = await knex(modelsTableName).where({ alias: 't_cross' });

  const tCrossTableName = getTableName({ id: tCrossModel.id, type: 'core' });

  const hasTargetModelId = await knex.schema.hasColumn(tCrossTableName, 'target_model_id');
  const hasTargetFieldId = await knex.schema.hasColumn(tCrossTableName, 'target_field_id');
  const hasTargetRecordId = await knex.schema.hasColumn(tCrossTableName, 'target_record_id');
  const hasTemplateModelId = await knex.schema.hasColumn(tCrossTableName, 'template_model_id');
  const hasTemplateFieldId = await knex.schema.hasColumn(tCrossTableName, 'template_field_id');
  const hasTemplateRecordId = await knex.schema.hasColumn(tCrossTableName, 'template_record_id');
  const hasDvfFieldId = await knex.schema.hasColumn(tCrossTableName, 'dvf_field_id');
  const hasDvfRecordId = await knex.schema.hasColumn(tCrossTableName, 'dvf_record_id');

  await knex.schema.table(tCrossTableName, async (table) => {
    hasTargetModelId && table.dropColumn('target_model_id');
    hasTargetFieldId && table.dropColumn('target_field_id');
    hasTargetRecordId && table.dropColumn('target_record_id');
    hasTemplateModelId && table.dropColumn('template_model_id');
    hasTemplateFieldId && table.renameColumn('template_field_id', 'dtf_field_id');
    hasTemplateRecordId && table.renameColumn('template_record_id', 'dtf_record_id');

    !hasDvfFieldId && table.integer('dvf_field_id');
    !hasDvfRecordId && table.integer('dvf_record_id');
  });

  await knex(fieldsTableName)
    .where({ model: tCrossModel.id, alias: 'template_field_id' })
    .update({ name: 'DTF field', alias: 'dtf_field_id', options: JSON.stringify({ foreign_model: 'field', foreign_label: 'name' }), });

  await knex(fieldsTableName)
    .where({ model: tCrossModel.id, alias: 'template_record_id' })
    .update({ name: 'DTF record', alias: 'dtf_record_id' });

  await knex(fieldsTableName)
    .where({ model: tCrossModel.id, alias: 'data_record_id' })
    .update({ required_when_script: `p.record.getValue('type') === 'dtf_data_dvf'`, hidden_when_script: `p.record.getValue('type') !== 'dtf_data_dvf'` });

  const dvfFields = await knex(fieldsTableName).where({ type: 'data_visual' });
  await Promise.each(dvfFields, async (dvfField) => {
    const [dvfModel] = await knex(modelsTableName).where({ id: dvfField.model });
    const dvfModelTableName = getTableName({ id: dvfModel.id });
    const dvfRecords = await knex(dvfModelTableName).whereNotNull(dvfField.alias);

    await Promise.each(dvfRecords, async (dvfRecord) => {
      const [tCross] = await knex(tCrossTableName).where({ id: dvfRecord[dvfField.alias] });
      const [dtfField] = await knex(fieldsTableName).where({ id: tCross.dtf_field_id });
      const [dtfModel] = await knex(modelsTableName).where({ id: dtfField.model });
      const [dtfRecord] = await knex(getTableName({ id: dtfModel.id })).where({ id: tCross.dtf_record_id });

      await knex.schema.alterTable(dvfModelTableName, async (table) => table.text(dvfField.alias).alter());
      await knex(dvfModelTableName).where({ id: dvfRecord.id }).update({ [dvfField.alias]: dtfRecord[dtfField.alias] });
      await knex(tCrossTableName).where({ id: tCross.id }).update({ dvf_field_id: dvfField.id, dvf_record_id: dvfRecord.id });
    });
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
