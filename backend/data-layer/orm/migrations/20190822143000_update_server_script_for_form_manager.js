/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex, Promise) => {
  return knex(modelsTableName).where({ alias: 'page' }).limit(1)
    .then(([model]) => model && knex(getTableName(model))
      .where({ alias: 'form_manager' }).update({
        server_script: `const { find, map, reduce, filter, each, pick } = lodash;

const request = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const viewModel = await p.getModel('view');
  const fieldModel = await p.getModel('field');
  const formModel = await p.getModel('form');

  formModel.setOptions({ includeNotInsertedRecords: true });

  const record = await formModel.findOne({ id: request.record_id }) || {};
  const modelId = request.modelId || request.model || (record.attributes && record.getValue('model'));

  if (!modelId) {
    return p.response.json({
      record: record.attributes,
      references: [],
      fields: [],
      model: {},
    });
  } else {
    record.setValue('model', modelId);
  }

  const models = await modelModel.find({});
  const fields = await fieldModel.find({ model: modelId });

  const model = find(models, (model) => model.getValue('id') === modelId);
  const modelIds = map(models, (model) => model.getValue('id'));

  const referenceFields = await fieldModel
    .find({ model: modelIds, type: { IN: ['reference', 'reference_to_list'] }, options: { LIKE: \`%"foreign_model":"\${model.getValue('alias')}"%\` } })
    .orFind({ model: modelIds, type: 'global_reference' });
  const referenceViews = await viewModel.find({ model: modelIds });

  const references = reduce(referenceFields, (result, field) => {
    const model = find(models, (model) => model.getValue('id') === field.getValue('model'));
    const views = filter(referenceViews, (view) => view.getValue('model') === field.getValue('model'));

    each(views, (view) => {
      result.push({
        model: pick(model.attributes, ['id', 'alias', 'name', 'plural']),
        field: field.attributes,
        view: view.attributes,
      });
    });

    return result;
  }, []);

  const rtlFields = await fieldModel.find({ model: modelId, type: 'reference_to_list' });
  const rtlReferences = reduce(rtlFields, (result, field) => {
  	const { foreign_model, view: foreign_view } = JSON.parse(field.getValue('options'));
    const model = find(models, (model) => model.getValue('alias') === foreign_model);
    const rtlView = find(referenceViews, (view) => view.getValue('model') === model.getValue('id') && view.getValue('alias') === foreign_view) ||
                    find(referenceViews, (view) => view.getValue('model') === model.getValue('id'));

    result.push({
      model: pick(model.attributes, ['id', 'alias', 'name', 'plural']),
      field: field.attributes,
      view: rtlView.attributes,
    });

    return result;
  }, []);

  return p.response.json({
    record: record.attributes,
    model: model.attributes,
    fields: map(fields, 'attributes'),
    references: references.concat(rtlReferences),
  });
} catch (error) {
  p.response.error(error);
}`
      }));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
