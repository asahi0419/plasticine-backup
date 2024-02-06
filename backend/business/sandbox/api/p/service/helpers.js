import lodash from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';

export const referencedFields = async (modelId) => {
  return db.model('field')
    .where('options', 'like', `%"foreign_model":"${db.getModel(modelId).alias}"%`)
    .whereIn('type', ['reference', 'reference_to_list'])
    .orWhere('type', 'global_reference')
    .select(['id', 'model']);
};

export const modelReferences = (sandbox) => async (params) => {
  const p = sandbox.vm.p;

  try {
    const formModel = await p.getModel('form');
    const record = await formModel.setOptions({ includeNotInsertedRecords: true }).findOne({ id: +params.record_id }) || {};
    const modelId = params.modelId || +params.model || (record.attributes && record.getValue('model'));

    if (modelId) {
      record.setValue('model', modelId);
    } else {
      return p.response.json({
        record: record.attributes,
        references: [],
        fields: [],
        model: {},
      });
    }

    const views = await db.model('view')
      .select(['id', 'name', 'model'])
      .whereNotNull('model')
      .andWhere('__inserted', true);

    const fieldModel = await p.getModel('field');
    const refFields = await p.iterMap(fieldModel
      .fields(['id', 'alias', 'name', 'model', 'type', 'options'])
      .find({
        type: { IN: ['reference', 'reference_to_list'] },
        options: { LIKE: `%"foreign_model":"${db.getModel(modelId).alias}"%` },
        model: { '!=': modelId }
      })
      .orFind({ type: 'global_reference' }).raw());

    const refReferences = lodash.reduce(refFields, (result, field) => {
      const model = lodash.pick(db.getModel(field.model), ['id', 'alias', 'name', 'plural']);

      lodash.each(lodash.filter(views, { model: field.model }), (view) => {
        result.push({
          model,
          field,
          view,
        });
      });

      return result;
    }, []);

    const rtlFields = await p.iterMap(fieldModel
      .fields(['id', 'name', 'model', 'type', 'options'])
      .find({ model: modelId, type: 'reference_to_list' }).raw());
    const rtlReferences = lodash.reduce(rtlFields, (result, field) => {
      const model = lodash.pick(db.getModel(JSON.parse(field.options).foreign_model), ['id', 'alias', 'name', 'plural']);

      lodash.each(lodash.filter(views, { model: model.id }), (view) => result.push({
        model,
        field,
        view,
      }));

      return result;
    }, []);

    return [ ...refReferences, ...rtlReferences ];
  } catch (error) {
    
  }
}