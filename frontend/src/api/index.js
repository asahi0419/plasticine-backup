import qs from 'qs';
import axios from 'axios';
import lodash from 'lodash';
import PubSub from 'pubsub-js';

import store from '../store';
import normalizer from './normalizer';
import localStore from '../store/local';
import * as Auth from '../auth';
import * as Actions from '../actions/view/actions';

export const API_URL = localStore.get('API_URL') || '/api/v1';
export const TIME_ZONE_OFFSET = -new Date().getTimezoneOffset();

const instance = axios.create({
  baseURL: API_URL,
});

instance.interceptors.request.use((input = {}) => {
  const config = { ...input };
  if (!config.params) config.params = {};

  const headers = { XTimezoneOffset: TIME_ZONE_OFFSET };
  const queryOptions = qs.parse(window.location.search.replace(/^\?/, ''));

  if (queryOptions.logout) {
    const { session = {} } = Auth.getUser() || {};
    lodash.assign(config.params, { logout: true, session_id: session.id });
  }

  if (queryOptions.date_trunc) {
    lodash.assign(config.params, { date_trunc: queryOptions.date_trunc });
  }

  if (queryOptions.sso_provider) {
    lodash.assign(config.params, { sso_provider: queryOptions.sso_provider });
  }

  if (queryOptions.login) {
    lodash.assign(config.params, { login: queryOptions.login });
  }

  if (queryOptions.expired) {
    lodash.assign(config.params, { expired: queryOptions.expired });
  }

  if (config.params.token) {
    delete config.params.token;
  }

  const jwtToken = Auth.getJWTToken('JWT');
  if (jwtToken) headers.Authorization = jwtToken;

  const otpToken = Auth.getOTPToken('OTP');
  if (otpToken) headers.Authorization = otpToken;

  const staticToken = Auth.getStaticToken();
  if (!jwtToken && staticToken) headers['X-Token'] = staticToken;

  const session = Auth.getSession();
  if (session) headers.session = session;

  config.headers = headers;
  // config.timeout = 30000;
  return config;
});

export async function request({ method, path, data = {}, params = {}, config = {} }) {
  const response = (method === 'get')
    ? await instance[method](path, { paramsSerializer: (p) => qs.stringify(p, { arrayFormat: 'brackets' }), params, ...config })
    : await instance[method](path, data, config);

  return response.data.action
    ? Actions.processResponse(response.data, store.redux.instance.dispatch)
    : response;
}

export async function executeAction(modelAlias, actionAlias, data, config) {
  return instance.post(
    `${modelAlias}/action/${actionAlias}`,
    data,
    config,
  );
}

class PlasticineApi {
  normalize(response) {
    return normalizer(response)
  }

  authUser(data) {
    return request({
      method: 'post',
      path: '__command/auth_user',
      data,
    });
  }

  logout(data) {
    return request({
      method: 'post',
      path: '__command/logout',
      data,
    });
  }

  loadModels(params) {
    return request({
      method: 'get',
      path: '__command/load/models',
      params,
    });
  }

  init(params) {
    return request({
      method: 'get',
      path: '__command/init',
      params,
    });
  }

  loadUser(params) {
    return request({
      method: 'get',
      path: '__command/load/user',
      params,
    });
  }

  loadPages(params) {
    return request({
      method: 'get',
      path: '__command/load/pages',
      params: {
        ...params,
        exec_by: {
          ...params.exec_by,
          type: 'page',
        }
      }
    });
  }

  loadDashboards(params) {
    return request({
      method: 'get',
      path: '__command/load/dashboards',
      params,
    });
  }

  loadSidebar(params) {
    return request({
      method: 'get',
      path: '__command/load/sidebar',
      params,
    });
  }

  loadView(modelAlias, viewAlias, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/view/${viewAlias}`,
      params,
    });
  }

  loadViewCount(modelAlias, params) {
    return request({
      method: 'get',
      path: `${modelAlias}/count`,
      params,
    });
  }

  loadForm(modelAlias, recordId, params = {}) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/form`,
      params: {
        ...params,
        id: recordId,
        exec_by: {
          ...params.exec_by,
          type: 'form',
        },
      },
    });
  }

  loadFieldOptions(modelAlias, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/field_options`,
      params,
    });
  }

  loadFields(modelAlias, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/fields`,
      params,
    });
  }

  loadTranslation(modelAlias, recordId, fieldAlias, options) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/${recordId}/${fieldAlias}/translation`,
      params: { options },
    });
  }

  loadReferencedFields(modelAlias, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/referenced_fields`,
      params,
    });
  }

  loadTemplateFields(modelIds) {
    return request({
      method: 'get',
      path: '__command/load/template_fields',
      params: { modelIds },
    });
  }

  loadWorklog(modelAlias, recordId, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/${recordId}/worklog`,
      params,
    });
  }

  loadChartScope(chartId, params) {
    return request({
      method: 'get',
      path: `__command/load/chart_scope/${chartId}`,
      params,
    });
  }

  loadFAIcons(params) {
    return request({
      method: 'get',
      path: '__command/load/fa_icons',
      params,
    });
  }

  loadTemplate(recordId, fieldId) {
    return request({
      method: 'get',
      path: '__command/load/template',
      params: { recordId, fieldId },
    });
  }

  loadTemplates(modelId) {
    return request({
      method: 'get',
      path: '__command/load/templates',
      params: { modelId },
    });
  }

  fetchRecords(modelAlias, params) {
    return request({
      method: 'get',
      path: `${modelAlias}`,
      params,
    });
  }

  fetchRecord(modelAlias, recordId, params) {
    return request({
      method: 'get',
      path: `${modelAlias}/${recordId}`,
      params,
    });
  }

  processFilter(modelAlias, filter) {
    return request({
      method: 'get',
      path: `__command/${modelAlias}/process_filter`,
      params: { filter },
    });
  }

  executeAction(modelAlias, actionAlias, data, config) {
    return executeAction(
      modelAlias,
      actionAlias,
      data,
      config,
    );
  }

  executeRecordScript(modelAlias, recordId, fieldAlias, data) {
    return request({
      method: 'post',
      path: `${modelAlias}/${recordId}/script/${fieldAlias}`,
      data,
    });
  }

  executeAppearance(modelAlias, appearanceId, records = [], data = {}) {
    return request({
      method: 'post',
      path: `${modelAlias}/appearance/${appearanceId}?records=${records}`,
      data,
    });
  }

  executeMapAppearance(modelAlias, appearanceId, params = {}) {
    return request({
      method: 'get',
      path: `${modelAlias}.geojson`,
      params: { ...params, appearance_id: appearanceId },
      config: { responseType: params.no_cache ? 'json' : 'arraybuffer' },
    });
  }

  getRecordSiblings(modelAlias, recordId, params = {}) {
    return request({
      method: 'get',
      path: `${modelAlias}/${recordId}/siblings`,
      params: { ...params, full_set: true },
    });
  }

  exportView(modelAlias, format, params = {}, config = {}) {
    if (['docx', 'pdf'].includes(format)) {
      return request({
        method: 'get',
        path: `${modelAlias}.${format}`,
        params: {
          ...params,
          disposition: 'attachment',
          time_zone_offset: TIME_ZONE_OFFSET,
        },
        config: { responseType: 'arraybuffer', ...config },
      });
    }
    return request({
      method: 'get',
      path: `${modelAlias}.${format}`,
      params: {
        ...params,
        disposition: 'attachment',
        time_zone_offset: TIME_ZONE_OFFSET,
      },
      config: { responseType: 'arraybuffer', ...config },
    });
  }

  getAttachment(attachment = {}, params) {
    return request({
      method: 'get',
      path: `storage/${attachment.id}/${attachment.file_name}`,
      params,
      config: { responseType: 'arraybuffer' },
    });
  }

  getAttachmentURL(attachment = {}) {
    if (attachment.id && attachment.file_name) {
      const token = Auth.getJWTToken() ? `jwt_token=${Auth.getJWTToken()}` : `token=${Auth.getStaticToken()}`;
      return `storage/${attachment.id}/${attachment.file_name}?${token}`;
    }
  }

  getCurrentUserToken() {
    return request({
      method: 'get',
      path: '__command/load/token',
    });
  }

  createRecord(modelAlias, data = {}) {
    return request({
      method: 'post',
      path: modelAlias,
      data,
    });
  }

  updateRecord(modelAlias, recordId, data, options = {}) {
    return request({
      method: 'put',
      path: `${modelAlias}/${recordId}?${qs.stringify(options)}`,
      data,
    });
  }

  deleteRecord(modelAlias, recordId, options) {
    return request({
      method: 'delete',
      path: `${modelAlias}/${recordId}`,
      data: { data: options },
    });
  }

  updateUserSettings(modelAlias, recordId, options) {
    return request({
      method: 'post',
      path: `__command/${modelAlias}/${recordId}/update_user_settings`,
      data: options,
    });
  }

  uploadAttachments(model, record, files) {
    const config = { headers: { 'content-type': 'multipart/form-data' } };
    const data = new FormData();

    files.forEach((file, i) => {
      const blob = store.blob.instance.get(file.fileName);

      if (blob) {
        if (blob.context && blob.context.field) {
          data.append(`context[${i}][field]`, blob.context.field.id);
        }

        data.append(`files[${i}]`, blob.file, file.fileName);
        store.blob.instance.remove(file.fileName);
      }
    });

    config.onUploadProgress = ({ loaded, total }) => {
      const topic = `background.progress.uploading.${model.id}.${record.id}`;
      const key = files.map(({ fileName }) => fileName).join(' - ');
      PubSub.publish(topic, { key, progress: (loaded / total) * 100 });
    };

    return request({
      method: 'post',
      path: `storage/${model.alias}/${record.id}`,
      data,
      config,
    });
  }

  loadViews(modelAlias, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/views`,
      params,
    });
  }

  invokeWebService(webServiceAlias, params) {
    return request({
      method: 'post',
      path: `web_service/call/${webServiceAlias}`,
      data: params,
    });
  }

  loadReferences(modelAlias, recordId, params) {
    return request({
      method: 'get',
      path: `__command/load/${modelAlias}/${recordId}/references`,
      params,
    });
  }
}

export default new PlasticineApi();
