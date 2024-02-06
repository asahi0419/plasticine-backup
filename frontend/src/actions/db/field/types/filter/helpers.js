import { map } from 'lodash/collection';

import PlasticineApi from '../../../../../api';
import normalize from '../../../../../api/normalizer';
import { getModel } from '../../../../../helpers';

export const loadFields = async (modelId) => {
  const model = getModel(modelId);
  const { data: { data: fields } } = await PlasticineApi.loadFields(model.alias);
  const data = map(fields, (attributes) => {
    return { type: 'field', id: attributes.id, attributes: attributes }
  });
  const { entities } = normalize({ data });

  return entities;
}

export const loadTemplates = async (modelId) => {
  const { data: result } = await PlasticineApi.loadTemplates(modelId);
  const { data: templates } = result;

  return { templates };
}
