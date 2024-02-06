import Promise from 'bluebird';
import { map, keyBy, filter, each, uniq, compact, isString, isEmpty } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import ValueExtractor from './value-extractor.js';
import { parseOptions } from '../../../helpers/index.js';
import { extractIds } from './reference.js';
import { humanize } from '../../fetcher/humanizer/index.js';

const getCrossRecords = async (field, values) => {
  if (!values.length) return [];

  let result = [];

  const ids = [];
  const records = [];

  each(compact(values), (value) => {
    const parsed = parseOptions(value);

    if (isEmpty(parsed)) {
      ids.push(value);
    } else {
      const model = db.getModel(parsed.__type || parsed.model);

      records.push({
        id: `${field.id}/${model.id}/${parsed.id}`,
        source_field: field.id,
        target_model: model.id,
        target_record_id: parsed.id,
      });
    }
  });

  if (ids.length) {
    result = await db.model('global_references_cross').where({ __inserted: true }).whereIn('id', extractIds(ids));
  }

  return [ ...result, ...records ];
};

export const loadData = async (field, values, sandbox, params) => {
  const options = parseOptions(field.options) || { references: [] };
  const referencesMap = keyBy(options.references, 'model');

  const crossRecords = await getCrossRecords(field, values);
  const crossRecordsMap = keyBy(crossRecords, 'id');

  const crossModels = await db.model('model').whereIn('id', uniq(map(crossRecords, 'target_model')));
  const crossModelsMap = keyBy(crossModels, 'id');

  const targetRecordsMap = {};
  const modelValueGenerators = {}

  await Promise.map(Object.values(crossModelsMap), async (model) => {
    const crossRecordIds = map(filter(crossRecords, { target_model: model.id }), 'target_record_id');

    const records = await db.model(model.alias).where({ __inserted: true }).whereIn('id', crossRecordIds);

    const reference = referencesMap[model.alias];
    if (reference && reference.label) {
      const valueExtractor = new ValueExtractor(reference.label);
      modelValueGenerators[model.alias] = valueGenerator(valueExtractor);
      await humanize(model.id, valueExtractor.fields, records, sandbox, undefined, params );
    } else {
      modelValueGenerators[model.alias] = valueGenerator(new DefaultValueExtractor());
    }

    targetRecordsMap[model.alias] = keyBy(records, 'id');
  });

  return { targetRecordsMap, crossRecordsMap, crossModelsMap, modelValueGenerators };
};

function valueGenerator(valueExtractor) {
  return (targetRecord, crossRecord) => {
    return valueExtractor.extract(targetRecord, crossRecord);
  };
}

class DefaultValueExtractor {
  extract(targetRecord, crossRecord) {
    return [crossRecord.target_model, targetRecord.id].join('/')
  }
}

function isFilterValue(value) {
  if (!value) return false;
  return (isString(value) && value.includes('/'));
}

async function getHumanizedFromFilterValue(value, field) {
  const references = parseOptions(field.options).references || [];
  const referencesMap = keyBy(references, 'model');
  const [modelId, recordId] = value.split('/');

  const modelAlias = await db.model('model').pluck('alias').where({ id: modelId }).getOne();
  const record = await db.model(modelAlias).where({ id: recordId, __inserted: true }).getOne();

  const reference = referencesMap[modelAlias];
  if (record && reference && reference.label) {
    const valueExtractor = new ValueExtractor(reference.label);
    return `${valueExtractor.extract(record)}`;
  }

  return value;
}

export default (field, sandbox) => async (value) => {
  if (!value) return;

  if (isFilterValue(value)) {
    return getHumanizedFromFilterValue(value, field);
  }

  const { targetRecordsMap, crossRecordsMap, crossModelsMap, modelValueGenerators } = await loadData(field, [value], sandbox);
  const parsed = parseOptions(value);

  const crossRecord = isEmpty(parsed) ? crossRecordsMap[value] : { source_field: field.id, target_model: db.getModel(parsed.__type || parsed.model).id, target_record_id: parsed.id };
  if (!crossRecord) return;

  const crossModel = crossModelsMap[crossRecord.target_model];
  if (!crossModel) return;

  const targetRecord = targetRecordsMap[crossModel.alias][crossRecord.target_record_id];
  if (!targetRecord) return;

  return modelValueGenerators[crossModel.alias](targetRecord, crossRecord);
};
