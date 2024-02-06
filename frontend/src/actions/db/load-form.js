import qs from 'qs';
import lodash from 'lodash'

import history from '../../history';
import normalize from '../../api/normalizer';
import PlasticineApi from '../../api';
import loadPageVariables from './load-page-variables';
import { processError } from '../helpers';
import { parseOptions } from '../../helpers';
import { APP_METADATA_FULFILLED, RECORDS_FULFILLED, METADATA_FULFILLED, APP_OPTIONS_UPDATED } from '../types';

export const loadForm = async (modelAlias, recordId, params) => {
  const { metadata, user } = await loadFormMetadata(modelAlias, recordId, params);
  const model = lodash.find(metadata.model, { alias: modelAlias })
  const form = lodash.find(metadata.form, { model: model.id });

  const { metadata: db } = await loadRecordMetadata(modelAlias, recordId, getRecordParams(form));
  const record = getRecord(modelAlias, recordId, db);
  const variables = form.page ? await loadPageVariables(metadata.page[form.page], { record_id: recordId }) : {};

  form.__metadata.params = params;

  return { payload: { metadata, db }, record, variables, user };
};

export default (modelAlias, { recordId, params }) => async (dispatch) => {
  if (recordId === 'new') {
    const { data: result } = await PlasticineApi.createRecord(
      modelAlias,
      { data: { attributes: { __inserted: false } } },
    );

    const options = {}
    if (params.associate) {
      options.system_actions = { after: [
        {
          name: 'associate',
          params: { target: params.associate }
        }
      ] }
    }
    
    return history.push(`/${modelAlias}/form/new/${result.data.id}?${qs.stringify(options)}`);
  }

  try {
    const { payload: { metadata, db }, variables, user } = await loadForm(modelAlias, recordId, params);
    if (history.isLeft('form', { modelAlias, recordId })) return;
  
    dispatch({ type: APP_METADATA_FULFILLED, payload: metadata });
    dispatch({ type: APP_OPTIONS_UPDATED, payload: { user } });
    dispatch({ type: METADATA_FULFILLED, target: `${modelAlias}/form`, payload: metadata });
    dispatch({ type: RECORDS_FULFILLED, payload: db });
  
    return { variables };
  } catch (error) {
    processError(error, dispatch);
  }
};

export const loadFormMetadata = async (modelAlias, recordId, params) => {
  params = {...params, exec_by: lodash.omit(params.exec_by, 'parent')}
  const { data } = await PlasticineApi.loadForm(modelAlias, parseInt(recordId), params);
  const { entities } = await normalize(data);
  if (data.errors) processError({ response: { data } });
  return { metadata: entities, user: data.user };
}

export const loadRecordMetadata = async (modelAlias, recordId, params) => {
  const { data } = await PlasticineApi.fetchRecord(modelAlias, parseInt(recordId), params)
  const { entities } = await normalize(data);

  return { metadata: entities };
}

const getRecordParams = (form) => {
  const params = {
    humanize: true,
    full_set: true,
    load_extra_fields: true,
  };

  const { components: { list, options } } = parseOptions(form.options);
  const attachmentField = lodash.includes(list, "attachment");
  const { __attachments__: attachments } = options;

  if (attachments) {
    const { last_versions_view: last = {}, previous_versions_view: prev = {} } = attachments;
    const filter = lodash.map(lodash.compact([last.filter, prev.filter]), (f) => `(${f})`).join(' OR ');
    params.count = 'attachment';
    params.count_filters = { attachment: filter };
    params.include = 'attachments';
  } else if (attachmentField) {
    params.count = 'attachment';
    params.count_filters = { attachment: 'last_version = true' };
    params.include = 'attachments';
  }
  return params;
}

export const getRecord = (modelAlias, recordId, db) => {
  const record = (db[modelAlias] || {})[recordId];

  lodash.each(record.__metadata.relationships, ({ id, type }, key) => {
    lodash.each(record.__metadata.relationships[key], ({ id, type }) => {
      lodash.assign(record.__metadata.relationships[type][id], db[type][id])
    });
  });

  record.__metadata = {
    ...record.__metadata,
    ...lodash.pick(qs.parse(location.search.substring(1)), ['associate']),
  };

  return record;
};
