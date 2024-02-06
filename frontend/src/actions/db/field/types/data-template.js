import { reduce } from 'lodash/collection';
import { merge } from 'lodash/object'
import { isEmpty } from 'lodash/lang'

import PlasticineApi from '../../../../api';
import normalize from '../../../../api/normalizer';
import { parseOptions } from '../../../../helpers';

export default (dispatch, getState) => async (field, recordId, value) => {
  const fields = await loadFields(value);
  const detailFields = await loadDetailFields();
  const uiRules = await loadUiRules();

  const metadata = merge(fields, detailFields, uiRules);

  return { payload: { metadata } };
};

const loadFields = async (value) => {
  const { attr: attributes } = parseOptions(value);
  if (isEmpty(attributes)) return { metadata: [] };

  const fieldIds = reduce(attributes, (result, item) => {
    if (item.p !== -1) result.push(item.p);
    result.push(item.f);
    return result;
  }, []);

  const { data } = await PlasticineApi.fetchRecords('field', { filter: `id IN (${fieldIds})`, page: { size: 10000 } });
  const { entities } = normalize(data);

  return entities;
}

const loadDetailFields = async () => {
  const params = { filter: `model.alias = 'field'` }

  const { data } = await PlasticineApi.fetchRecords('field', params);
  const { entities } = normalize(data);

  return entities;
}

const loadUiRules = async () => {
  const params = { filter: `(model.alias = 'field') AND (active = TRUE) ` }

  const { data } = await PlasticineApi.fetchRecords('ui_rule', params);
  const { entities } = normalize(data);

  return entities;
}
