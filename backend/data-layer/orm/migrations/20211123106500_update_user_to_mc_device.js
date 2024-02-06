import Promise from 'bluebird';
import { find } from 'lodash-es';

import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import userSeed from '../seeds/04-users.js';

const migrate = (knex) => async (models) => {
  await updateUser(knex, models);
};

const updateUser = async (knex, models) => {
  const fieldModel = models.field;
  const userModel = models.user;
  const formModel = models.form;
  const layoutModel = models.layout;

  await updateUserFields(knex, userModel, fieldModel);
  await updateUserForms(knex, userModel, formModel);
  await updateUserLayout(knex, userModel, layoutModel);
};

const updateUserFields = async (knex, userModel, fieldModel) => {
  const deviceFieldSeed = find(userSeed.fields, { alias: 'devices' });

  return knex(getTableName({ id: fieldModel.id }))
    .where({ model: userModel.id, alias: 'phones' })
    .update({ alias: deviceFieldSeed.alias, name: deviceFieldSeed.name, options: deviceFieldSeed.options });
};

const updateUserForms = async (knex, userModel, formModel) => {
  return Promise.each(userSeed.forms, async formSeed => {
    await knex(getTableName({ id: formModel.id }))
      .where({ model: userModel.id, alias: formSeed.alias })
      .update({ options: formSeed.options });
  });
};

const updateUserLayout = async (knex, userModel, layoutModel) => {
  const layoutSeed = userSeed.layouts[0];

  return knex(getTableName({ id: layoutModel.id }))
    .where({ model: userModel.id, name: layoutSeed.name })
    .update({ options: layoutSeed.options });
};

export const up = (knex) => {
  return onModelsExistence(knex, [ 'field', 'form', 'layout', 'user' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
