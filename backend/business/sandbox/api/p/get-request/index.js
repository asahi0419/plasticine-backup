import { map, compact, omit, pick, isArray } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import ModelProxy, { wrapRecord } from '../../model/index.js';
import { filterToPlainObject } from './helpers.js';
import { getPermittedFields } from '../../../../security/permissions.js';
import buildDocumentByTemplParams, { getLatestParam } from './document-template.js';
import { parseOptions } from '../../../../helpers/index.js';

export default ({ request }) => () => {
  if (!request) return { buildDocumentByTemplParam: getLatestParam(buildDocumentByTemplParams) };

  let params = {
    ...(request.params || {}),
    ...(request.query || {}),
    ...(request.body || {}),
  };

  if (request.headers) {
    if (request.headers['client'] === 'mobile') {
      params.client = 'mobile';
    }
  }

  if (request.files) {
    params.files = request.files;
  }

  if (request.model) {
    params.modelAlias = request.model.alias;
  }

  if (params.alt || params.lon || params.lat) {
    params.gps = {};

    if (params.alt) {
      params.gps.alt = params.alt;
      params = omit(params, 'alt');
    }
    if (params.lon) {
      params.gps.lon = params.lon;
      params = omit(params, 'lon');
    }
    if (params.lat) {
      params.gps.lat = params.lat;
      params = omit(params, 'lat');
    }
  }

  if (!params.exec_by) {
    params.exec_by = {};
  }

  return {
    ...params,
    buildDocumentByTemplParam: getLatestParam(buildDocumentByTemplParams), 
    __cookies: request.cookies,
    __headers: request.headers,
    __meta: {
      ip: request.ip,
      hostname: request.hostname,
      method: request.method,
      protocol: request.protocol,
    },
    getRecord: async () => {
      const { record = {} } = params;
      if (!record.id) return null;

      const result = await getRecord(request.model.alias, record.id, request);
      if (!result) return null;

      return result;
    },
    getParentRecord: async () => {
      if (request.parentRecord) return request.parentRecord

      const { viewOptions = {} } = request.body;
      const { embedded_to = {} } = viewOptions;

      const { model, record_id } = embedded_to;
      if (!(model && record_id)) return null;

      const result =  await getRecord(model, record_id, request);
      if (!result) return null;

      return result;
    },
    getAttributesFromFilter: (params = {}) => {
      const { model = {} } = request;
      const { viewOptions = {} } = request.body;
      const { filter, hidden_filter } = viewOptions;
      const { only_hidden = (model.type === 'core') ? false : true } = params;

      const filterParts = only_hidden ? [ hidden_filter ] : [ filter, hidden_filter ];
      const filterString = map(compact(filterParts), (f) => `(${f})`).join(' AND ');

      return filterToPlainObject(filterString, request);
    },
    getApiDirectives: () => {
      const { headers = {} } = request;

      const header = headers['p-api-directive'] || '';
      const directive = Buffer.from(header, 'base64').toString('ascii');
      const options = parseOptions(directive, { silent: true });

      return isArray(options) ? options : [];
    },
  };
};

async function getRecord(modelAlias, recordId, request) {
  const model = db.getModel(modelAlias);
  const record = await db.model(model).where({ id: recordId }).getOne();

  const sandbox = await request.sandbox.cloneWithoutDynamicContext();
  await sandbox.assignRecord(record, model);

  const fields = await getPermittedFields(model, sandbox);
  const fieldset = map(fields, 'alias');

  const modelProxy = new ModelProxy(model, sandbox);

  // TODO: skip validation in more accurate way
  const insecureModels = [
    'field', // synthetic field options
    'user', // account reference as object on user creation process
  ];

  if (insecureModels.includes(modelProxy.model.alias)) modelProxy.setOptions({ validateAttributes: false });

  const recordProxy = await wrapRecord(modelProxy.setFields(fields), {
    preload_data: true,
    fieldset,
  })(pick(record, [...fieldset, '__inserted']));
  recordProxy.setFlags(modelProxy.flags);

  return recordProxy;
}