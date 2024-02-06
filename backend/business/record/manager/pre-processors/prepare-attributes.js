import moment from 'moment';
import Promise from 'bluebird';
import {
  omit,
  keys,
  keyBy,
  reduce,
  isString,
  isPlainObject,
  isArray,
  isNaN,
  isBoolean,
  isNull,
  isNumber
} from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import typecast from '../../../field/value/typecast/index.js';
import { parseOptions } from '../../../helpers/index.js';

const PROCESSORS = {
  defaultProcessor,
  string: stringProcessor,
  autonumber : autonumberProcessor,
  datetime: datetimeProcessor,
  integer: numericProcessor,
  float: numericProcessor,
  boolean: booleanProcessor,
  reference: referenceProcessor,
  reference_to_list: referenceToListProcessor,
  global_reference: globalReferenceProcessor,
  array_string: arrayStringProcessor,
};

export default (service, attributes, flags) => {
  const fieldsMap = keyBy(service.modelFields, 'alias');
  const processedAttributes = {};
  let promise = Promise.bind();

  for (const key of keys(omit(attributes, ['id']))) {
    if(exSaveFlagProcessor(flags?.ex_save, key)) continue;

    const field = fieldsMap[key];
    const valueProcessor = field ?
      PROCESSORS[field.type] || PROCESSORS.defaultProcessor : PROCESSORS.defaultProcessor;

    promise = promise
      .then(() => valueProcessor(attributes[key], field, service.sandbox, service.mode))
      .then((value) => {
        processedAttributes[key] = value;
      });
  }

  return promise.then(() => processedAttributes);
};

function datetimeProcessor(value, field, sandbox) {
  const { date_only } = parseOptions(field.options);
  if (!value) return null;
  if (typeof value === 'number') return new Date(value);
  const utcOffset = sandbox.timeZoneOffset || 0;
  const parsedDate = date_only ? moment(value, moment.ISO_8601).utcOffset(utcOffset).hour(0).minute(0).second(0) : moment(value, moment.ISO_8601);
  return (parsedDate.isValid() ? parsedDate : moment())._d;
}

function numericProcessor(value) {
  if (isString(value) && value.trim() === '') return null;
  return value;
}

function autonumberProcessor(value, field) {
  return value;
}

function booleanProcessor(value, field) {
  if (isBoolean(value) || isNull(value)) {
    return value;
  } else {
    const options = parseOptions(field.options);
    return options.default !== undefined ? options.default : false;
  }
}

function referenceProcessor(value, field, sandbox) {
  if (isPlainObject(value)) return value;
  if (isNaN(parseInt(value, 10))) return null;
  return value;
}

async function referenceToListProcessor(value, field, sandbox) {
  if (!value) return [];

  if (isArray(value)) {
    return Promise.all(value.map(item => referenceToListProcessor(item, field, sandbox)));
  }

  const { foreign_model } = parseOptions(field.options);
  let uniqFieldAlias = 'id';

  if (!isNumber(value) && isNaN(parseInt(value))) {
    const uniqField = db.getField({
      model: db.getModel(foreign_model).id,
      type: 'string',
      index: 'unique',
    });

    if (uniqField) uniqFieldAlias = uniqField.alias;
  }

  const key = isPlainObject(value) ? value[uniqFieldAlias] : value;
  const record = await db.model(foreign_model).where({ [uniqFieldAlias]: key }).getOne();
  return record ? record.id : value
}

function globalReferenceProcessor(value) {
  if (isString(value)) {
    return reduce(value.split('/'), (r, v, i) => ({ ...r, [i ? 'id' : 'model']: +v }), {});
  }

  if (value && value.constructor.name === 'RecordProxy') {
    return value.attributes;
  }

  return value;
}

export function arrayStringProcessor(value, field) {
  const { multi_select: multi } = parseOptions(field.options);

  if (multi) {
    if (isString(value)) {
      value = value.split(',').map(v => v.trim().replace(/\'(.*)\'/,'$1'));
    }
  }

  return value || null;
}

export function stringProcessor(value, field, sandbox, mode) {
  if(mode !== 'secure' && isArray(value))
    return JSON.stringify(value);
  if(mode !== 'secure')
    return value;

  return typecast(field, value) || null;
}

export function defaultProcessor(value, field, sandbox, mode) {
  if (mode !== 'secure') return value;

  return typecast(field, value) || null;
}

function exSaveFlagProcessor(exSave, key) {
  return exSave?.recalcEscalTimes === false && key === 'esc_rule_date_time';
}
