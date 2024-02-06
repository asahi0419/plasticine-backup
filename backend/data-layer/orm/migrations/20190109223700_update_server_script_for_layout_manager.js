/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = async (knex) => {
  const [pageModel] = await knex(modelsTableName).where({ alias: 'page' });
  const pageTableName = getTableName({ id: pageModel.id, type: 'core' });

  return knex(pageTableName).where({ alias: 'form_manager' }).update({
    server_script: `const { record_id, modelId, type = 'layout' } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const layoutModel = await p.getModel('layout');
  const userSettingModel = await p.getModel('user_setting');

  layoutModel.setOptions({ includeNotInsertedRecords: true });

  const layout = await layoutModel.findOne({ id: record_id });

  if (type === 'user_setting') {
    const customizedLayout = await userSettingModel
      .findOne({
        user: p.currentUser.getValue('id'),
        model: layoutModel.getValue('id'),
        record_id
      });

    if (customizedLayout) layout.setValue('options', customizedLayout.getValue('options'));
  }

  if (modelId) layout.setValue('model', modelId);
  const layoutModelId = layout.getValue('model');

  const selection = {};
  if (layoutModelId) {
    selection.model = await modelModel.findOne({ id: layoutModelId });
    selection.fields = await fieldModel.find({ model: layoutModelId, virtual: false })
      .find({ type: { 'NOTIN': ['journal', 'data_template', 'data_visual'] } });
  }

  const model = selection.model ? selection.model.attributes : {};
  const fields = selection.fields ? selection.fields.map(({ attributes }) => p.translate(attributes, 'field', ['name'])) : [];

  const referenceFields = fields.filter(field => (field.type === 'reference') && JSON.parse(field.options).foreign_model);
  const foreignModelAliases = referenceFields.map(({ options }) => JSON.parse(options).foreign_model);

  const foreignModels = await modelModel.find({ alias: { 'IN': foreignModelAliases } });

  p.response.json({
    foreignModels: foreignModels.map(({ attributes }) => attributes),
    record: layout.attributes,
    fields,
    model,
    type
  });
} catch (error) {
  p.response.error(error);
}`
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
