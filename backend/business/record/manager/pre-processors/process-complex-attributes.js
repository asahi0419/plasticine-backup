import Promise from 'bluebird';
import { find, map, isPlainObject, isArray, isString, isObject, isEqual, compact, keys, pick } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import logger from '../../../logger/index.js';
import { parseOptions } from '../../../helpers/index.js';
import { createTemplateModel } from '../../../template/model.js';
import { createManager } from '../factory.js';
import { arrayStringProcessor } from './prepare-attributes.js';
import { getDefaultAutonumber } from '../../manager/helpers/extract-default-value.js';

const PROCESSORS = {
  autonumber: autonumberProcessor,
  reference: referenceProcessor,
  reference_to_list: referenceToListProcessor,
  journal: journalProcessor,
  data_template: dataTemplateProcessor,
  data_visual: dataVisualProcessor,
  array_string: arrayStringProcessor,
};

const T_CROSS_ATTRIBUTES = ['dtf_record_id', 'dtf_field_id', 'data_model_id', 'data_record_id'];

export default async (attributes, fields, sandbox) => {
  const processedAttributes = {};

  await Promise.each(keys(attributes), async (alias) => {
    const field = find(fields, { alias });
    const processor = (field && PROCESSORS[field.type]) || defaultProcessor;

    try {
      processedAttributes[alias] = await processor(attributes[alias], field, sandbox, attributes);
    } catch (error) {
      logger.error(error)
    }
  });

  return processedAttributes;
};

async function autonumberProcessor(value, field, sandbox, attributes) {
  const {id} = attributes;
  if(id) {
    const options = parseOptions(field.options);
    return getDefaultAutonumber(options, id);
  }
  return value;
}

async function referenceProcessor(value, field, sandbox) {
  if (!isPlainObject(value)) return isString(value) ? db.getModel(value).id : value;

  const { foreign_model } = parseOptions(field.options);

  const uniqField = await db.model('field')
    .where({ model: db.getModel(foreign_model).id, index: 'unique' })
    .whereIn('alias', Object.keys(value))
    .getOne();

  const record = uniqField
    ? await db.model(foreign_model).where({ [uniqField.alias]: value[uniqField.alias] }).getOne()
    : null;

  const newRecord = record || await db.model(foreign_model, sandbox).createRecord(value, false);
  return newRecord.id;
}

function referenceToListProcessor(value, field, sandbox) {
  if (!isArray(value)) return value;
  const options = parseOptions(field.options);

  return Promise.map(value, async (item) => {
    if (!isPlainObject(item)) return item;
    const { id } = await db.model(options.foreign_model, sandbox).createRecord(item, false);
    return id;
  });
}

function journalProcessor(value, field) {
  return compact(isArray(value) ? value.map(processJournalItem) : [processJournalItem(value)])
    .filter(({ id, data }) => !id && !!data); // ignore preloaded existed journals and return only objects to create
}

async function dataTemplateProcessor(value, field, sandbox) {
  const tCross = await db.model('t_cross').where({
    dtf_field_id: field.id,
    dtf_record_id: sandbox.record.attributes.id,
  }).getOne();

  if (!tCross) await createTemplateModel(field, sandbox);

  return value
}

async function dataVisualProcessor(value, field, sandbox) {
  value = isObject(value) ? value : parseOptions(value);

  const isTCrossObject = isEqual(keys(value).sort(), T_CROSS_ATTRIBUTES.sort());
  const isTree = value.attr && value.attr.length;

  if (isTCrossObject) {
    await db.model('t_cross').insert({
      ...value,
      dvf_field_id: field.id,
      dvf_record_id: sandbox.record.getValue('id'),
    });

    const dtfField = db.getField({ id: value.dtf_field_id });
    const dtfRecord = await db.model(db.getModel(dtfField.model).alias).where({ id: value.dtf_record_id }).getOne();

    const privileges = map(
      await db.model('privilege').where({ model: field.model }),
      p => ({ ...pick(p, ['level', 'owner_type', 'owner_id']), model: value.data_model_id })
    );

    await db.model('privilege').where({ model: value.data_model_id }).delete();
    await Promise.each(privileges, (privilege) => db.model('privilege').insert(privilege));

    value = dtfRecord[dtfField.alias];
  }

  if (isTree) {
    const fieldTableName = db.model('field').tableName;
    const fieldIds = map(value.attr, 'f');
    const template = { field, value };

    const dataModel = await db.model('model').whereRaw(`id = (SELECT DISTINCT model from ${fieldTableName} where id IN (${fieldIds}))`).getOne();
    const dataRecord = await createManager({ ...dataModel, template }, sandbox, false).create({});

    const tCross = await db.model('t_cross').where({ id: dataModel.data_template }).getOne();

    const dtfField = db.getField({ id: tCross.dtf_field_id });
    const dtfRecord = await db.model(db.getModel(dtfField.model).alias).where({ id: tCross.dtf_record_id }).getOne();

    value = {
      dtf_field_id: dtfField.id,
      dtf_record_id: dtfRecord.id,
      data_model_id: dataModel.id,
      data_record_id: dataRecord.id,
    };

    return dataVisualProcessor(value, field, sandbox);
  }

  return isTCrossObject ? value : null;
}

function defaultProcessor(value) {
  return value;
}

function processJournalItem(item) {
  if (isPlainObject(item)) {
    item.data = sanitizeString(item.data || '');
    return item;
  }

  if (isString(item)) return { data: sanitizeString(item) };
}

function sanitizeString(string) {
  return string.replace(/(<([^>]+)>)/ig, '')
}
