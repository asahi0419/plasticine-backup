import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async ({ field, account }) => {
  await updateAccount(knex, field, account);
};

const updateAccount = async (knex, fieldModel, accountModel) => {
  const accountTableName = getTableName({id: accountModel.id});
  const fieldTable = getTableName({id: fieldModel.id});

  await knex(fieldTable).where({
    model: accountModel.id,
    alias: '2fa'
  }).update({alias: 'two_fa'});

  await knex(fieldTable).where({
    model: accountModel.id,
    alias: '2fa_activated'
  }).update({alias: 'two_fa_activated'});

  await knex(fieldTable).where({
    model: accountModel.id,
    alias: '2fa_code'
  }).update({alias: 'two_fa_code'});

  if (await knex.schema.hasColumn(accountTableName, '2fa_activated')) {
    await knex.schema.table(accountTableName, table => {
      table.renameColumn('2fa_activated', 'two_fa_activated');
    });
  }

  if (await knex.schema.hasColumn(accountTableName, '2fa_code')) {
    await knex.schema.table(accountTableName, table => {
      table.renameColumn('2fa_code', 'two_fa_code');
    });
  }

  if (await knex.schema.hasColumn(accountTableName, '2fa')) {
    await knex.schema.table(accountTableName, table => {
      table.renameColumn('2fa', 'two_fa');
    });
  }
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'field', 'account' ], migrate(knex));
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
