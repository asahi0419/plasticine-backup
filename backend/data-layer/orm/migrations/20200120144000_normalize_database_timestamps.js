/* eslint-disable */

import Promise from 'bluebird';

const getColumns = async (knex, dbName) => {
  const [ rows ] = await knex.raw(`
    SELECT DISTINCT column_type, column_name, table_name
    FROM information_schema.columns
    WHERE table_schema = '${dbName}'
    AND column_type LIKE '%timestamp%';
  `);

  return rows;
};

const setSqlMode = async (knex, modes) => {
  await knex.raw(`SET sql_mode = '${modes}';`);
};

const updateColumnsCharset = async (knex, dbName) => {
  await Promise.each(await getColumns(knex, dbName), async ({ table_name, column_name }, i) => {
    await knex.raw(`ALTER TABLE ${dbName}.${table_name} MODIFY COLUMN \`${column_name}\` timestamp NULL;`);
  });
};

export const up = async (knex) => {
  if (process.env.DB_TYPE !== 'mysql') return;

  await setSqlMode(knex, 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION');
  await updateColumnsCharset(knex, process.env.DB_NAME);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
