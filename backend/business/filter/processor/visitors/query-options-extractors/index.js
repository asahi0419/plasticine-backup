import {
  mergeWith,
  isArray,
  isString,
  isObject,
  cloneDeep,
  isUndefined,
  isNull,
  each,
  some
} from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import defaultExtractor from './default.js';
import booleanExtractor from './boolean.js';
import referenceToListExtractor from './reference-to-list.js';
import referenceExtractor from './reference.js';
import globalReferenceExtractor from './global-reference.js';
import trueStubExtractor from './true-stub.js';
import concatenatedFieldExtractor from './concatenated-field.js';
import dataVisualProcessor from './data-visual.js';
import arrayStringProcessor from './array-string/index.js';
import datetimeProcessor from './datetime.js';

const EXTRACTORS = {
  boolean: booleanExtractor,
  reference_to_list: referenceToListExtractor,
  reference: referenceExtractor,
  global_reference: globalReferenceExtractor,
  concatenated_field: concatenatedFieldExtractor,
  true_stub: trueStubExtractor,
  data_visual: dataVisualProcessor,
  array_string: arrayStringProcessor,
  datetime: datetimeProcessor,
};

const DEFAULT_OPTIONS = { datetime: { useIsoFormat: false } };

export default async (field, operator, value, context, options = DEFAULT_OPTIONS) => {
  let params;

  if (isUndefined(value)) {
    const modelTableName = db.model(field.model).tableName;
    if (operator.includes('like') || operator.includes('in')) operator = operator.includes('not') ? '!=' : '=';
    params = { where: [db.client.raw(`${modelTableName}.id ${operator} -1`)] };
  } else if (isArray(value) && some(value, (v) => isUndefined(v) || isNull(v))) {
    params = { where: [ false ] };
  } else {
    const extractQueryParams = EXTRACTORS[field.type] || defaultExtractor;
    options = options[field.type] || {};
    params = await extractQueryParams(field, operator, value, context, options);
  }

  return field.__parentField
    ? mergeWithParamsForNestedField(params, field)
    : params;
};

function mergeWithParamsForNestedField(params, field) {
  const parentField = field.__parentField;
  const parentTableName = db.model(parentField.model).tableName
  const foreignTableName = db.model(field.model).tableName;
  const asForeignTableName = foreignTableName + '_' + Math.random().toString().slice(2,8);
  const processedParams = cloneDeep(params);

  // TODO: implement more clever solution!
  // https://redmine.nasctech.com/issues/50214
  // https://redmine.nasctech.com/issues/57294
  // ==========================================================================
      each(processedParams.where, (item) => {
        if (isString(item[0])) {
          item[0] = item[0].replace(`${foreignTableName}.`, `${asForeignTableName}.`);
        }

        if (isObject(item)) {
          if (item.sql) {
            item.sql = item.sql.replace(`${foreignTableName}.`, `${asForeignTableName}.`);
          }
        }
      });

      each(processedParams.joins, (join) => {
        each(join.onItems, (on) => {
          on.left = on.left.replace(`${foreignTableName}.`, `${asForeignTableName}.`);
          on.right = on.right.replace(`${foreignTableName}.`, `${asForeignTableName}.`);
        });
      });
  // ==========================================================================

  const joinsParams = {
    joins: [{
      tableName: foreignTableName + ' AS ' + asForeignTableName,
      onItems: [{ left: `${parentTableName}.${parentField.alias}`, right: `${asForeignTableName}.id` }],
    }],
  };

  return mergeWith(joinsParams, processedParams, queryParamsMerger);
}

function queryParamsMerger(objValue, srcValue) {
  if (isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
