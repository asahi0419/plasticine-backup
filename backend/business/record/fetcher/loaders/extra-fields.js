import Promise from 'bluebird';
import {
  isArray,
  isString,
  map,
  keyBy,
  some,
  find,
  uniq,
  compact,
  has,
  pick,
  keys,
  toLower
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import { parseOptions } from '../../../helpers/index.js';
import ModelProxy, { wrapRecords } from '../../../sandbox/api/model/index.js';

export default async (rows, fetcher) => {
  const { params, fields, sandbox } = fetcher;
  if (!has(params, 'load_extra_fields') || toLower(params.load_extra_fields) === 'false') return rows;

  for (const field of fields) {
    if (field.type === 'reference') await referenceProcessor(field, rows, sandbox);
    if (field.type === 'data_template') await dataTemplateProcessor(field, rows, fetcher);
  }

  return rows;
};

async function getExtraFields(field) {
  const { alias, options } = field;
  const { foreign_model, extra_fields } = parseOptions(options);

  if (!isArray(extra_fields)) return;
  if (!extra_fields.length) return;

  return some(extra_fields, isString)
    ? await db.model('field').where({ model: db.getModel(foreign_model).id }).whereIn('alias', extra_fields)
    : await db.model('field').whereIn('id', extra_fields);
}

async function getRefenceRecordsMap(field, extraFields, rows, sandbox) {
  const { alias, options } = field;
  const { foreign_model, extra_fields } = parseOptions(options);

  const ids = uniq(compact(map(rows, alias)));
  const referenceRecords = await db.model(foreign_model).whereIn('id', ids).select('id', ...map(extraFields, 'alias'));

  const modelProxy = new ModelProxy(db.getModel(foreign_model), sandbox);
  const result = await wrapRecords(modelProxy, { select_raw: true })(referenceRecords);

  return keyBy(result, 'id');
}

async function referenceProcessor(field, rows) {
  const extraFields = await getExtraFields(field);
  if (!extraFields) return;

  await processReferences(field, extraFields, rows);
  await processReferencesExtra(field, extraFields, rows);
}

async function processReferences(field, extraFields, rows) {
  const referenceRecordsMap = await getRefenceRecordsMap(field, extraFields, rows);

  await Promise.each(rows, async (row) => {
    if (!row.__extraFields) row.__extraFields = {};
    if (!row.__extraAttributes) row.__extraAttributes = {};

    const referenceValue = row[field.alias];

    row.__extraFields[field.alias] = extraFields;
    row.__extraAttributes[field.alias] = referenceValue ? pick(referenceRecordsMap[referenceValue] || {}, map(extraFields, 'alias')) : {};
  });
}

async function processReferencesExtra(field, extraFields, rows) {
  await Promise.each(rows, async (row) => {
    const attributes = row.__extraAttributes[field.alias];

    await Promise.each(keys(attributes), async (alias) => {
      const extraField = find(extraFields, { alias });
      const { foreign_model } = parseOptions(extraField.options);

      if (extraField && extraField.type === 'reference') {
        const referenceRecord = await db.model(foreign_model).where({ id: attributes[extraField.alias] }).getOne();

        row.__extraAttributes[extraField.alias] = pick(referenceRecord || {}, map(row.__extraFields[extraField.alias], 'alias'));
      }
    });
  });
}

async function dataTemplateProcessor(field, rows, fetcher) {
  const { model, result } = fetcher;
  const [record] = result.records;
  if (!record) return

  const tCross = await db.model('t_cross').where({
    dtf_field_id: field.id,
    dtf_record_id: record.id
  }).whereNull('data_record_id').getOne();
  if (!tCross) return;

  const dataTemplate = await db.model('model').where({ type: 'template', data_template: tCross.id }).getOne();

  rows.forEach((row) => {
    if (!row.__extraAttributes) row.__extraAttributes = {};
    row.__extraAttributes[field.alias] = dataTemplate.id;
  });
}
