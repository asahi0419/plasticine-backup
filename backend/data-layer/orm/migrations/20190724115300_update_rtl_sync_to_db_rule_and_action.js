/* eslint-disable */

import { onModelExistence } from './helpers/index.js';

const DB_RULE_SCRIPT = `const options = utils.JSONParseSafe(p.record.getValue('options'));
const syncTo = options.sync_to;
const prevSyncTo = utils.JSONParseSafe(p.record.previousAttributes.options).sync_to;

if (syncTo === prevSyncTo) return;

const fieldModel = await p.getModel('field');

if (prevSyncTo) {
\tconst prevSyncedField = await fieldModel.findOne({ id: prevSyncTo });
\tif (prevSyncedField) {
\t\tconst prevSyncedFieldOptions = utils.JSONParseSafe(prevSyncedField.getValue('options'));
\t\t
\t\tif (prevSyncedFieldOptions.sync_to) {
\t\t\tawait db.model('field').where({ id: prevSyncedField.id }).update({ options: JSON.stringify({ ...prevSyncedFieldOptions, sync_to: null }) });
\t\t}
\t}
}

if (syncTo) {
\tconst syncedField = await fieldModel.findOne({ id: syncTo });
\tconst syncedFieldOptions = utils.JSONParseSafe(syncedField.getValue('options'));
\tif (syncedFieldOptions.sync_to !== p.record.getValue('id')) {
\t\tawait syncedField.update({ options: JSON.stringify({ ...syncedFieldOptions, sync_to: p.record.getValue('id') }) });
\t}
}`;

const ACTION_SCRIPT = `
const params = p.getRequest();
const record = await params.getRecord();
const { sync_to } = utils.JSONParseSafe(record.getValue('options'));
const rtlModel = await p.getModel('rtl');
const syncToField = await db.model('field').where({ id: sync_to }).getOne();
const rtlRecords = await db.model('rtl').where('source_field', record.id);

await db.model('rtl').where('source_field', syncToField.id).delete();
await Promise.map(rtlRecords, (rtlRecord) => {
\trtlModel.insert({
\t\tsource_field: syncToField.id,
    source_record_id: rtlRecord.target_record_id,
    target_record_id: rtlRecord.source_record_id,
\t});
});

p.actions.showMessage("The data synchronization successfully completed");
`;

const migrate_db_rule = (knex) => async (model, table) => {
  await knex(table).where({ name: 'On change RTL sync_to' }).update({ script: DB_RULE_SCRIPT });
};

const migrate_action = (knex) => async (model, table) => {
  await knex(table).where({ alias: 'synchronize', model: 2 }).update({ server_script: ACTION_SCRIPT });
};

export const up = async (knex) => {
  await onModelExistence(knex, 'db_rule', migrate_db_rule(knex));
  return onModelExistence(knex, 'action', migrate_action(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
