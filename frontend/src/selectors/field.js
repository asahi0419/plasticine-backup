import { filter, find } from 'lodash/collection';
import { values } from 'lodash/object';
import { isUndefined } from 'lodash/lang';

const METADATA_EXTRACTORS = {
  data_template: extractDataTemplateMetadata,
  data_visual: extractDataVisualMetadata,
  filter: extractFilterMetadata,
};

function extractDataTemplateMetadata(metadata, params) {
  const fields = values(metadata.field);
  const uiRules = values(metadata.ui_rule);

  return { fields, uiRules };
}

function extractDataVisualMetadata(metadata, params) {
  const template = { metadata: {}, options: params.options };

  if (!params.options.data_model_id) return { template };

  template.metadata.model = find(metadata.model, { id: params.options.data_model_id });
  template.metadata.fields = filter(metadata.field, { model: template.metadata.model.id });
  template.metadata.uiRules = values(metadata.ui_rule);
  template.metadata.extraFieldsAttributes = values(metadata.extra_fields_attribute);

  return { template };
}

function extractFilterMetadata(metadata, params) {
  if (isUndefined(metadata)) return {};

  const [ model ] = values(metadata.model);
  const fields = values(metadata.field);
  const templates = metadata.templates;

  return { model, fields, templates };
}

export default (metadata, model, field, params) => {
  const fieldSpecificMetadata = METADATA_EXTRACTORS[field.type](metadata, params);

  return { ...fieldSpecificMetadata };
};
