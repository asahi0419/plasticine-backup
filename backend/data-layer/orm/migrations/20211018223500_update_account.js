import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const migrate = (knex) => async ({ field, setting, account }) => {
  await updateAccount(knex, field, account);
  await addExpiredSetting(knex, setting);
};

const updateAccount = async (knex, fieldModel, accountModel) => {
  const fieldTable = getTableName({ id: fieldModel.id });
  const [ accountStatusField ] = await knex(fieldTable).where({ model: accountModel.id, alias: 'status' });

  if (!accountStatusField) return;

  const options = JSON.parse(accountStatusField.options);
  options.values.expired = 'Expired';

  await knex(fieldTable).where({
    model: accountModel.id,
    alias: 'status'
  }).update({ options: JSON.stringify(options) });
};

const addExpiredSetting = async (knex, setting) => {
  const settingTable = getTableName({ id: setting.id });
  const [ authSettingRecord ] = await knex(settingTable).where({ alias: 'authorization' });

  if (!authSettingRecord) return;

  const authSettings = JSON.parse(authSettingRecord.value);
  authSettings.password.expired_time = 0;

  return knex(settingTable).where({ alias: 'authorization' }).update({ value: authSettings });
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'field', 'setting', 'account' ], migrate(knex));
};

export const down = function (knex, Promise) {
  return Promise.resolve();
};
