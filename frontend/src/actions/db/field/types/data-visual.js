import PlasticineApi from '../../../../api';
import normalize from '../../../../api/normalizer';

export default (dispatch, getState) => async (field, recordId) => {
  const { metadata, options } = await loadTemplate(field, recordId);

  return { payload: { metadata }, options };
};

const loadTemplate = async (field, recordId) => {
  const { data } = await PlasticineApi.loadTemplate(recordId, field.id);
  const { entities } = normalize(data);

  return { metadata: entities, options: data.meta };
}
