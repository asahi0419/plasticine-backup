import Promise from 'bluebird';
import { keyBy, keys, toPairs, each, filter } from 'lodash-es';

import { onModelsExistence } from './helpers/index.js';
import getTableName from './helpers/table-name.js';
import phoneSeed from '../seeds/38-phones.js';

const migrate = (knex) => async (models) => {
  await updatePhone(knex, models);
};

const updatePhone = async (knex, models) => {
  const modelModel = models.model;
  const fieldModel = models.field;
  const formModel = models.form;
  const layoutModel = models.layout;
  const phoneModel = models.phone;

  await updatePhoneModel(knex, modelModel, phoneModel);

  const fieldsUpdateMap = {
    name: 'device_name',
    imei: 'device_id',
    status: 'state',
    model: 'model'
  };
  await updatePhoneFields(knex, fieldModel, phoneModel, fieldsUpdateMap);
  await updatePhoneForm(knex, formModel, phoneModel);
  await updatePhoneLayout(knex, layoutModel, phoneModel);
  await updatePhoneTable(knex, phoneModel, fieldsUpdateMap);
  await updatePhoneRecords(knex, phoneModel);
};

const updatePhoneModel = async (knex, model, phoneModel) => {
  const mcDeviceAttributes = {
    name: '[MC] Device',
    plural: '[MC] Devices',
    alias: 'mc_device',
  };

  return knex(getTableName({ id: model.id })).where({ alias: phoneModel.alias }).update(mcDeviceAttributes);
};

const updatePhoneFields = async (knex, fieldModel, phoneModel, fieldsUpdateMap) => {
  const fieldsSeeds = keyBy(phoneSeed.fields, 'alias');
  const fieldsToDelete = [ 'number', 'serial_number', 'description' ];

  const fields = await knex(getTableName({ id: fieldModel.id })).whereIn('alias', keys(fieldsUpdateMap)).andWhere({ model: phoneModel.id });
  await Promise.each(fields, async field => {
    const attributes = { ...fieldsSeeds[fieldsUpdateMap[field.alias]] };
    delete attributes.__lock;

    await knex(getTableName({ id: fieldModel.id })).where({ id: field.id }).update(attributes);
  });

  return knex(getTableName({ id: fieldModel.id })).whereIn('alias', fieldsToDelete).andWhere({ model: phoneModel.id }).delete();
};

const updatePhoneForm = async (knex, formModel, phoneModel) => {
  const formOptions = phoneSeed.forms[0].options;

  return knex(getTableName({ id: formModel.id }))
    .where({ model: phoneModel.id, alias: 'default' })
    .update({ options: formOptions });
};

const updatePhoneLayout = async (knex, layoutModel, phoneModel) => {
  const layoutOptions = phoneSeed.layouts[0].options;

  return knex(getTableName({ id: layoutModel.id }))
    .where({ model: phoneModel.id, name: 'Default', type: 'grid' })
    .update({ options: layoutOptions });
};

const updatePhoneTable = async (knex, phoneModel, fieldsUpdateMap) => {
  const deletedFieldAliases = [ 'description', 'number', 'serial_number' ];

  return knex.schema.table(getTableName({ id: phoneModel.id }), table => {
    each(filter(toPairs(fieldsUpdateMap), ([ from ]) => from !== 'model'), ([ from, to ]) => table.renameColumn(from, to));
    table.dropColumns(...deletedFieldAliases);
  });
};

const updatePhoneRecords = async (knex, phoneModel) => knex(getTableName({ id: phoneModel.id }))
  .where({ state: 'approved' })
  .update({ state: 'active' });

export const up = (knex) => {
  return onModelsExistence(knex, [ 'model', 'field', 'phone', 'form', 'layout' ], migrate(knex));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
