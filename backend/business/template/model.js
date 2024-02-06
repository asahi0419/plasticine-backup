import db from '../../data-layer/orm/index.js'
import ModelImporter from '../import/index.js';
import scheme from './scheme.js';

export const createTemplateModel = async (field, sandbox) => {
  const model = db.getModel(field.model);
  const record = sandbox.record.attributes;

  const [data_template] = await db.model('t_cross').insert({
    dtf_field_id: field.id,
    dtf_record_id: record.id,
  }, ['id']);

  const dataModel = await new ModelImporter(sandbox, 'seeding').process({
    ...scheme,
    name: `Data for template - ${model.name} #${record.id} (${field.name})`,
    plural: `Data for template - ${model.name} #${record.id} (${field.name})`,
    alias: `template_${model.alias}_${record.id}_${field.id}`,
    data_template,
  });

  return db.model('t_cross').where({ id: data_template }).update({ data_model_id: dataModel.id });
};
