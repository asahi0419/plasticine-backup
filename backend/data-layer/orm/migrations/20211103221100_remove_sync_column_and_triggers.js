import Promise from 'bluebird';

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  if (!await knex.schema.hasColumn(modelsTableName, 'sync')) return;

  await knex.schema.table(modelsTableName, table => table.dropColumn('sync'));

  const dropRecordsSyncTrigger = tableName => `DROP TRIGGER IF EXISTS records_sync_trigger ON public.${tableName};`;
  const dropModelTrigger = tableName => `DROP TRIGGER IF EXISTS model_create_or_update_trigger ON public.${tableName};`;
  const dropMetaUpdateTrigger = tableName => `DROP TRIGGER IF EXISTS meta_create_or_update_trigger ON public.${tableName};`;
  const tasks = [ dropRecordsSyncTrigger, dropModelTrigger, dropMetaUpdateTrigger ];

  const tableIds = await knex(modelsTableName).select('id').whereIn('type', [ 'custom', 'core' ]);

  return Promise.each(tableIds, ({ id }) => Promise.each(tasks, async task => {
    await knex.raw(task(getTableName({ id })));
  }));
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
