import Promise from 'bluebird';
import { onModelsExistence, getModelTableName } from './helpers/index.js';

const METADATA = ['field', 'action', 'db_rule', 'view', 'layout', 'appearance', 'filter', 'form', 'permission', 'privilege', 'escalation_rule', 'ui_rule', 'scheduled_task', 'planned_task']

const migrate = (knex) => async (models, table) => {
  await Promise.each(Object.keys(models), async m => {
    const tableName = await getModelTableName(knex, m)

    // remove duplicates
    await knex.raw(`DELETE FROM ${tableName} a USING ${tableName} b WHERE a.ctid < b.ctid AND a.id = b.id;`)

    // add constraint
    const { rows } = await knex.raw(`SELECT * FROM pg_constraint WHERE conname = '${tableName}_pkey'`)
    if (rows.length) return

    return knex.schema.table(tableName, function (table) {
      table.primary('id');
    })
  })
}

export const up = (knex) => {
  return onModelsExistence(knex, METADATA, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};