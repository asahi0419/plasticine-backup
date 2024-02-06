import Promise from 'bluebird';
import { find, reduce, mergeWith, keys, isNil, isArray, isObject } from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import RecordManager from './index.js';
import pickAttributes from './helpers/attributes-picker.js';
import prepareAttributes from './pre-processors/prepare-attributes.js';
import extractDefaultValue from './helpers/extract-default-value.js';

export const buildRecord = (service, attributes = {}) => mergeWith(
  attributes,
  processFields(service, attributes),
  mergeStrategy
);

const mergeStrategy = (objValue, srcValue) => {
  if (!isNil(objValue)) return objValue;
  return objValue || srcValue;
};

const processVirtualAttributes = async (record, attributes, fields, sandbox) => {
  await Promise.each(keys(attributes), async (alias) => {
    const field = find(fields, { alias });

    if (field.type === 'reference_to_list') {
      if (!isArray(attributes[alias])) return;

      const rtlModel = db.getModel('rtl');
      await Promise.each(attributes[alias], async (value) => {
        await new RecordManager(rtlModel, sandbox).build({
          source_field: field.id,
          source_record_id: record.id,
          target_record_id: value,
          created_by: sandbox.user.id,
        }, true);
      });
    }
  });
}

const processCrossAttributes = async (record, attributes, fields, sandbox) => {
  await Promise.each(keys(attributes), async (alias) => {
    const field = find(fields, { alias });

    if (field.type === 'global_reference') {
      if (!isObject(attributes[alias])) return;

      const grcModel = db.getModel('global_references_cross');
      const { model, __type, id: target_record_id } = attributes[alias];
      const targetModel = db.getModel(__type || model);

      record[alias] = (await new RecordManager(grcModel, sandbox).build({
        source_field: field.id,
        source_record_id: record.id,
        target_model: targetModel.id,
        created_by: sandbox.user.id,
        target_record_id,
      }, true))['id'];

      attributes[alias] = {
        model: targetModel.id,
        id: target_record_id,
      };
    }
  });
}

const processFields = (service = {}, attributes) => {
  const { modelFields = [] } = service;

  return reduce(modelFields, (result, field) => {
    result[field.alias] = extractDefaultValue(field, service.sandbox, attributes);
    return result;
  }, {});
};

const build = (service, attributes) => {
  service.sandbox.addVariable('action', 'build');
  return buildRecord(service, attributes);
};

export const persistentBuild = async (service, attributes) => {
  const { model, modelFields, sandbox } = service;

  const [ id ] = await db.model(model).insert({__inserted: false}, ['id']);
  const preparedAttributes = await prepareAttributes(service, attributes);
  const record = build(service, { ...preparedAttributes, id });

  const virtualAttributes = pickAttributes(record, modelFields, 'virtual');
  await processVirtualAttributes(record, virtualAttributes, modelFields, sandbox);
  const crossAttributes = pickAttributes(record, modelFields, 'cross');
  await processCrossAttributes(record, crossAttributes, modelFields, sandbox);

  const schemaAttributes = pickAttributes(record, modelFields, 'schema');
  const primaryAttributes = { __inserted: false };

  schemaAttributes.updated_at=null;
  schemaAttributes.updated_by=null;

  await db.model(model).where({ id }).update({
    ...schemaAttributes,
    ...primaryAttributes,
  });

  return {
    ...schemaAttributes,
    ...virtualAttributes,
    ...crossAttributes,
    ...primaryAttributes,
  };
};

export default build;
