/* eslint-disable */

import Promise from 'bluebird';

const getTables = async (knex, dbName) => {
  const [ rows ] = await knex.raw(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_type='BASE TABLE'
    AND table_schema = '${dbName}';
  `);

  return rows;
}

const getColumnsVarchar = async (knex, dbName) => {
  const [ rows ] = await knex.raw(`
    SELECT DISTINCT table_name, column_name, column_type
    FROM information_schema.columns
    WHERE table_schema = '${dbName}'
    AND column_type LIKE '%varchar%'
    AND character_set_name != 'utf8';
  `);

  return rows;
}

const getColumnsText = async (knex, dbName) => {
  const [ rows ] = await knex.raw(`
    SELECT DISTINCT table_name, column_name, column_type
    FROM information_schema.columns
    WHERE table_schema = '${dbName}'
    AND column_type LIKE '%text%'
    AND character_set_name != 'utf8';
  `);

  return rows;
}

const updateDefaultCharset = async (knex, dbName) => {
  await knex.raw(`ALTER DATABASE ${dbName} CHARACTER SET utf8 COLLATE utf8_general_ci;`);
}

const updateTablesCharset = async (knex, dbName) => {
  await Promise.each(await getTables(knex, dbName), async ({ table_name }) => {
    await knex.raw(`ALTER TABLE ${dbName}.${table_name} DEFAULT CHARSET=utf8;`);
  });
}

const updateColumnsCharset = async (knex, dbName) => {
  await Promise.each(await getColumnsVarchar(knex, dbName), async ({ table_name, column_name }) => {
    await knex.raw(`ALTER TABLE ${dbName}.${table_name} MODIFY COLUMN \`${column_name}\` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`);
  });
  await Promise.each(await getColumnsText(knex, dbName), async ({ table_name, column_name }) => {
    await knex.raw(`ALTER TABLE ${dbName}.${table_name} MODIFY COLUMN \`${column_name}\` text CHARACTER SET utf8 COLLATE utf8_general_ci NULL;`);
  });
}

export const up = async (knex) => {
  if (process.env.DB_TYPE !== 'mysql') return;

  await updateDefaultCharset(knex, process.env.DB_NAME);
  await updateTablesCharset(knex, process.env.DB_NAME);
  await updateColumnsCharset(knex, process.env.DB_NAME);
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
