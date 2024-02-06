/* eslint-disable */

import Promise from 'bluebird';
import getTableName from './helpers/table-name.js';

const SCRIPTS_BY_MANAGER_TYPE = {
  appearance_manager: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const appearanceModel = await p.getModel('appearance');

  appearanceModel.setOptions({ includeNotInsertedRecords: true });

  const appearance = await appearanceModel.findOne({ id: record_id });

  if (modelId) appearance.setValue('model', modelId);
  const appearanceModelId = appearance.getValue('model');

  const model = await modelModel.findOne({ id: appearanceModelId });
  const fields = await fieldModel.find({ model: appearanceModelId });

  p.response.json({
    record: appearance.attributes,
    fields: fields.map(({ attributes }) => attributes),
    model: model ? model.attributes : {}
  });
} catch (error) {
  p.response.error(error);
}`,

  chart_manager: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const chartModel = await p.getModel('chart');

  chartModel.setOptions({ includeNotInsertedRecords: true });

  const chart = await chartModel.findOne({ id: record_id });

  if (modelId) chart.setValue('data_source', modelId);
  const chartDatasourceId = chart.getValue('data_source');

  const model = await modelModel.findOne({ id: chartDatasourceId });
  const fields = await fieldModel.find({ model: chartDatasourceId });

  p.response.json({
    record: chart.attributes,
    fields: fields.map(({ attributes }) => attributes),
    model: model ? model.attributes : {}
  });
} catch (error) {
  p.response.error(error);
}`,

  dashboard_manager: `const { record_id } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const viewModel = await p.getModel('view');
  const dashboardModel = await p.getModel('dashboard');

  const models = await modelModel.find({});
  const views = await viewModel.find({});

  dashboardModel.setOptions({ includeNotInsertedRecords: true });

  const dashboard = await dashboardModel.findOne({ id: record_id });

  p.response.json({
    record: dashboard.attributes,
    models: models.map(({ attributes }) => attributes),
    views: views.map(({ attributes }) => attributes)
  });
} catch (error) {
  p.response.error(error);
}`,

  filter_manager: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const filterModel = await p.getModel('filter');

  filterModel.setOptions({ includeNotInsertedRecords: true });

  const filter = await filterModel.findOne({ id: record_id });

  if (modelId) filter.setValue('model', modelId);
  const filterModelId = filter.getValue('model');

  const model = await modelModel.findOne({ id: filterModelId });
  const fields = await fieldModel.find({ model: filterModelId });

  p.response.json({
    record: filter.attributes,
    fields: fields.map(({ attributes }) => attributes),
    model: model ? model.attributes : {}
  });
} catch (error) {
  p.response.error(error)
}`,

  form_manager: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const viewModel = await p.getModel('view');
  const fieldModel = await p.getModel('field');
  const formModel = await p.getModel('form');

  formModel.setOptions({ includeNotInsertedRecords: true });

  const form = await formModel.findOne({ id: record_id });

  if (modelId) form.setValue('model', modelId);
  const formModelId = form.getValue('model');

  const selection = {};
  selection.models = await modelModel.find();
  if (formModelId) {
    selection.fields = await fieldModel.find({ model: formModelId });
    selection.references = await fieldModel
      .find({ type: 'reference', options: { LIKE: \`"foreign_model_id":\${formModelId}}\` } })
      .orFind({ type: 'reference', options: { LIKE: \`"foreign_model_id":\${formModelId},\` } })
      .orFind({ type: 'global_reference' });
  }

  const models = selection.models.map(({ attributes }) => attributes);
  const fields = selection.fields ? selection.fields.map(({ attributes }) => attributes) : [];
  const references = selection.references ? selection.references.map(({ attributes }) => attributes) : [];

  const modelIds = references.map(({ model }) => model);
  const referenceModels = models.filter(({ id }) => modelIds.includes(id));
  const views = await viewModel.find({ type: 'grid', model: modelIds });
  const referenceViews = views.map(({ attributes: { id, alias, name, filter, model } }) => ({ id, alias, name, filter, model }));

  const relatedViews = [];

  references.forEach(field => {
    const views = referenceViews.filter(({ model }) => field.model === model);
    const referenceModel = referenceModels.find(({ id }) => field.model === id);

    views.forEach(view => {
      relatedViews.push({
        model: { id: referenceModel.id, alias: referenceModel.alias, name: referenceModel.name },
        field,
        view
      });
    });
  });

  return p.response.json({
    record: form.attributes,
    references: relatedViews,
    fields,
  });
} catch (error) {
  p.response.error(error);
}`,

  layout_manager: `const { record_id, modelId, type = 'layout' } = p.getRequest();

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
    selection.fields = await fieldModel.find({ model: layoutModelId, virtual: false, type: { '!=': 'journal' } });
  }

  const model = selection.model ? selection.model.attributes : {};
  const fields = selection.fields ? selection.fields.map(({ attributes }) => attributes) : [];

  const referenceFields = fields.filter(field => field.type === 'reference');
  const foreignModelIds = referenceFields.map(({ options }) => JSON.parse(options).foreign_model_id);

  const foreignModels = await modelModel.find({ id: foreignModelIds });

  p.response.json({
    foreignModels: foreignModels.map(({ attributes }) => attributes),
    record: layout.attributes,
    fields,
    model,
    type
  });
} catch (error) {
  p.response.error(error);
}`,

  permission_manager: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const permissionModel = await p.getModel('permission');

  permissionModel.setOptions({ includeNotInsertedRecords: true });

  const permission = await permissionModel.findOne({ id: record_id });

  if (modelId) permission.setValue('model', modelId);
  const permissionModelId = permission.getValue('model');

  const model = await modelModel.findOne({ id: permissionModelId });
  const fields = await fieldModel.find({ model: permissionModelId });

  p.response.json({
    record: permission.attributes,
    fields: fields.map(({ attributes }) => attributes),
    model: model ? model.attributes : {}
  });
} catch (error) {
  p.response.error(error)
}`,
}

export const up = function(knex) {
  const managerTypes = Object.keys(SCRIPTS_BY_MANAGER_TYPE);

  const promises = managerTypes.map(type => knex(getTableName({ id: 6, type: 'core' }))
    .where({ alias: type })
    .update({ server_script: SCRIPTS_BY_MANAGER_TYPE[type] })
  );

  return Promise.all(promises);
};

export const down = function(knex) {
  return Promise.resolve();
};
