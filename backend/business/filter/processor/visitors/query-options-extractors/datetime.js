import moment from 'moment-timezone';
import { map, isArray, isString, isObject } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { parseDateFormat, parseOptions } from '../../../../helpers/index.js';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATE_ONLY_FORMAT, DATE_ONLY_FORMATS, DATE_INTERVALS } from '../../../../constants/index.js';

const getColumn = (modelTableName, field, precision) => {
  return (db.client.provider === 'postgres')
    ? `date_trunc('${precision}', ${modelTableName}.${field.alias})`
    : `${modelTableName}.${field.alias}`;
};

const getFormat = (format) => {
  const d = 'YYYY-MM-DD';
  const h = format.includes('HH') ? ' HH' : '';
  const m = format.includes('mm') ? ':mm' : '';
  const s = format.includes('ss') ? ':ss' : '';

  return `${d}${h}${m}${s}`;
};

const getPrecision = (precision) => {
  if (['milliseconds', 'second', 'minute', 'hour', 'day', 'week', 'month', 'quarter', 'year'].includes(precision)) {
    return precision;
  }
};

const getPrecisionFromOptions = (options) => {
  if (options.date_only || DATE_ONLY_FORMATS.includes(options.format)) {
    return 'day'
  }
  return 'second'
};

const getValue = (value, format, options, sandbox) => {
  const resultFormat = options.date_only ? DEFAULT_DATE_ONLY_FORMAT : DEFAULT_DATE_FORMAT;
  const utcOffset = options.date_only ? sandbox.timeZoneOffset : 0;
  const formatter = (v) => {
    let value = !(v instanceof moment) ? moment(v, format) : v;
    return value instanceof moment ? value.utcOffset(utcOffset).format(resultFormat) : value;
  }
  return isArray(value) ? map(value, formatter) : formatter(value);
};

const processInterval = (_operator, _value, timeZoneOffset) => {
  let value = _value;
  let m1 = timeZoneOffset ? moment().utcOffset(timeZoneOffset) : moment();
  let m2 = m1.clone();

  // NOTE: this switch could be replaced with algoryth base on interval name, ex.:
  // Last means subtract, Next - add, second word correspond to keys in moment library.
  switch (value) {
    case 'Today':
      value = [m1.startOf('day'), m2.endOf('day')];
      break;
    case 'Yesterday':
      value = [m1.startOf('day').subtract(1, 'day'), m2.endOf('day').subtract(1, 'day')];
      break;
    case 'Tomorrow':
      value = [m1.startOf('day').add(1, 'day'), m2.endOf('day').add(1, 'day')];
      break;

    // Week
    //NOTE: In moment week starts from sunday not monday bacause add(1, 'day') used for week periods.
    case 'This week':
      value = [m1.startOf('week').add(1, 'day'), m2.endOf('week').add(1, 'day')];
      break;
    case 'Last week':
      value = [
        m1.startOf('week').subtract(1, 'week').add(1, 'day'),
        m2.endOf('week').subtract(1, 'week').add(1, 'day')
      ];
      break;
    case 'Next week':
      value = [
        m1.startOf('week').add(1, 'week').add(1, 'day'),
        m2.endOf('week').add(1, 'week').add(1, 'day')
      ];
      break;

    // Month
    case 'This month':
      value = [m1.startOf('month'), m2.endOf('month')];
      break;
    case 'Last month':
      value = [m1.subtract(1, 'month').startOf('month'), m2.subtract(1, 'month').endOf('month')];
      break;
    case 'Next month':
      value = [m1.add(1, 'month').startOf('month'), m2.add(1, 'month').endOf('month')];
      break;

    // Quarter
    case 'This quarter':
      value = [m1.startOf('quarter'), m2.endOf('quarter')];
      break;
    case 'Last quarter':
      value = [m1.subtract(1, 'quarter').startOf('quarter'), m2.subtract(1, 'quarter').endOf('quarter')];
      break;
    case 'Next quarter':
      value = [m1.add(1, 'quarter').startOf('quarter'), m2.add(1, 'quarter').endOf('quarter')];
      break;

    // Year
    case 'This year':
      value = [m1.startOf('year'), m2.endOf('year')];
      break;
    case 'Last year':
      value = [m1.subtract(1, 'year').startOf('year'), m2.subtract(1, 'year').endOf('year')];
      break;
    case 'Next year':
      value = [m1.add(1, 'year').startOf('year'), m2.add(1, 'year').endOf('year')];
      break;
  }

  let operator = _operator;
  switch (operator) {
    case '=':
      operator = 'between';
      break;
    case '<':
    case '>=':
      value = value[0];
      break;
    case '>':
    case '<=':
      value = value[1];
      break;
  }

  return [operator, value];
}

export default async (field, operator, value, context = {}, extractionOptions = {}) => {
  const { dateTruncPrecision } = context.options || {};

  const options = parseOptions(field.options);
  const format = extractionOptions.useIsoFormat ? DEFAULT_DATE_FORMAT : parseDateFormat(options);
  const precision = getPrecision(dateTruncPrecision) || getPrecisionFromOptions(options);

  const modelTableName = db.model(field.model).tableName;
  const column = getColumn(modelTableName, field, precision);
  const result = { where: [], whereOperator: 'and', froms: [] };

  if (value) {
    if (isString(value) && DATE_INTERVALS.includes(value)) {
      [operator, value] = processInterval(operator, value, context.sandbox.timeZoneOffset);
    }

    value = getValue(value, format, options, context.sandbox);

    if (['=', '!=', '<', '>', '<=', '>=', 'in', 'not in', 'between'].includes(operator)) {
      if (field.__parentField) {
        const from = { tableName: modelTableName };

        from.tableName = db.model(field.__parentField.model).tableName;
        from.joins = [{
          tableName: modelTableName,
          onItems: [
            {
              left: `${modelTableName}.id`,
              right: `${from.tableName}.${field.__parentField ? field.__parentField.alias : 'id'}`,
            },
          ],
        }];

        result.froms.push(from);
      }


      if (operator === 'between') {
        if (!value[0] || !value[1]) {
          result.where.push(false);
        } else {
          result.where.push(db.client.raw(`${column} is not null`));
          result.where.push(db.client.raw(`${column} >= '${value[0]}'`));
          result.where.push(db.client.raw(`${column} <= '${value[1]}'`));
        }
      } else {
        if (['is not', '!='].includes(operator)) {
          if (isArray(value)) {
            result.where.push(db.client.raw(`${column} < '${value[0]}'`));
            result.where.push(db.client.raw(`${column} > '${value[1]}'`));
          } else {
            result.where.push(db.client.raw(`${column} is null`));
          }
          result.whereOperator = 'or';
        }

        if (['in', 'not in'].includes(operator)) {
          result.where.push(db.client.raw(`${column} ${operator} (${value.map((v) => `'${v}'`)})`));
        //NOTE: Array value should not be processed here (https://redmine.nasctech.com/issues/89215)
        } else if (!isArray(value)) {
          result.where.push(db.client.raw(`${column} ${operator} '${value}'`));
        }
      }
    }
  } else {
    if (['is not', '!='].includes(operator)) {
      result.where.push(db.client.raw(`${column} is not null`))
    } else if (['<', '>', '>=', '<='].includes(operator)) {
      result.where.push(db.client.raw(`${modelTableName}.id ${operator} -1`));
    } else {
      result.where.push(db.client.raw(`${column} is null`));
    }
  }

  return result;
};
