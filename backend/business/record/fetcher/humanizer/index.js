import Promise from 'bluebird';
import { has, compact, each, filter } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import getCollectionHumanizer from './types/index.js';
import { getPermittedFields } from '../../../security/permissions.js';

import { getSetting } from '../../../../business/setting/index.js';

export default ({ model, fields, sandbox, params = {}, result = {} }) => {
  const { records } = result
  if ([false, 'false'].includes(params.humanize)) return;

  const fieldset = params.fields || {};
  const fieldsAliases = compact((fieldset[`_${model.alias}`] || '').split(','));

  return humanize(model.id, fieldsAliases, records, sandbox, { fields }, { currentDepthReferenceObjSearch: getSetting('limits.lookup_max_ref_obj_search')} );
};

// For now this function modifies records by adding __humanAttributes for each record)
export const humanize = async (modelId, fieldsAliases, records = [], sandbox, context, params = {}) => {
  params.currentDepthReferenceObjSearch--;

  const model = db.getModel(modelId);
  const permittedParams = fieldsAliases.length > 0 ? { filter: fieldsAliases, filter_in: 'alias' } : {};
  const fields = await getPermittedFields(model, sandbox, { ...permittedParams, accessible: true }, context);

  each(filter(fields, { __access: false }), (field) => {
    if(has(params, 'skipFieldPermission') && params.skipFieldPermission === true) {
      field.__access = true;
      return;
    }
    each(records, (record) => record[field.alias] = undefined);
  });

  return Promise.map(fields, (field) => {
    return getCollectionHumanizer(field, sandbox, params)(records);
  });
};
