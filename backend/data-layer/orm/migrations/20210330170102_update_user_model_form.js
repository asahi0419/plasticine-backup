/* eslint-disable */


import * as HELPERS from './helpers/index.js';
import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

const migrateForms = async (knex, models) => {
  const [ userModel ] = await knex(modelsTableName).where({ alias: 'user' });

  const defaultForm = await HELPERS.getRecord(knex, 'form', { model: userModel.id, alias: 'default' });
  if (!defaultForm) return;

  await HELPERS.updateRecord(knex, 'form',
    { model: userModel.id, alias: 'default' },
    { condition_script: 'p.record.isPersisted() && p.currentUser.canAtLeastWrite()', order: 200 });

  const creteUserForm = await HELPERS.getRecord(knex, 'form', { model: userModel.id, alias: 'create_user' });
  if (!creteUserForm) return;

  await HELPERS.updateRecord(knex, 'form',
    { model: userModel.id, alias: 'create_user' },
    { condition_script: '!p.record.isPersisted() && p.currentUser.canAtLeastWrite()' });

};


const migrate = (knex) => async (models) => {
  await migrateForms(knex, models);
};

export const up = (knex) => {
  const models = ['form', 'user'];
  return HELPERS.onModelsExistence(knex, models, migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
