import moment from 'moment';
import {
  omitBy,
  find,
  each,
  isArray,
  isString,
  isNull,
  isNaN,
  isObject,
  isBoolean,
  isDate,
  isUndefined,
  isPlainObject
} from 'lodash-es';

import db from '../../../data-layer/orm/index.js';
import { parseOptions } from '../../helpers/index.js';

const isNumber = (v) => !isObject(v) && !isNaN(+v);

export const isFieldValueValid = (field = {}, value) => {
  if (isNull(value) || (field.type === 'journal')) return true;

  const options = parseOptions(field.options);

  switch (field.type) {
    case 'array_string':
      return options.multi_select ? isArray(value) : isString(value);
    case 'boolean':
      return isBoolean(value);
    case 'datetime':
      return isDate(value) || moment(value).isValid();
    case 'reference_to_list':
      return isArray(value);
    case 'integer':
    case 'float':
    case 'primary_key':
    case 'reference':
      return isNumber(value);
    case 'global_reference':
      return isNumber(value) || isPlainObject(value);
    case 'autonumber':
    case 'string':
    case 'data_template':
    case 'data_visual':
      return isString(JSON.stringify(value));
    case 'fa_icon':
    case 'file':
    case 'condition':
    case 'filter':
    case 'color':
      return isString(value);
    case 'geo_point':
      if (!value) return true;
      try {
        const v = isString(value) ? JSON.parse(value) : value;
        db.client.getGeometry().geomFromGeoJSON({ type: 'Point', coordinates: v });
        return true;
      } catch (e) {
        return false;
      }
    case 'geo_line_string':
      if (!value) return true;
      try {
        const v = isString(value) ? JSON.parse(value) : value;
        db.client.getGeometry().geomFromGeoJSON({ type: 'LineString', coordinates: v });
        return true;
      } catch (e) {
        return false;
      }
    case 'geo_polygon':
      if (!value) return true;
      try {
        const v = isString(value) ? JSON.parse(value) : value;
        db.client.getGeometry().geomFromGeoJSON({ type: 'Polygon', coordinates: v });
        return true;
      } catch (e) {
        return false;
      }
    case 'geo_geometry':
      try {
        const v = isString(value) ? value : JSON.stringify(value);
        db.client.getGeometry().geomFromGeoJSON(v)
        return true;
      } catch (e) {
        return false;
      }
  }

  return false;
};

export const fieldValueError = (field = {}, value, sandbox) => {
  const options = parseOptions(field.options);
  let expected;

  switch (field.type) {
    case 'array_string':
      expected = options.multi_select ? 'array' : 'string';
      break;
    case 'boolean':
      expected = 'boolean';
      break;
    case 'datetime':
      expected = 'datetime';
      break;
    case 'reference_to_list':
      expected = 'array';
      break;
    case 'integer':
    case 'float':
    case 'primary_key':
    case 'reference':
    case 'global_reference':
      expected = 'number';
      break;
    case 'string':
    case 'fa_icon':
    case 'file':
    case 'data_template':
    case 'data_visual':
    case 'condition':
    case 'filter':
    case 'color':
    case 'autonumber':
      expected = 'string';
      break;
    case 'geo_point':
      expected = 'array (Point)';
      break;
    case 'geo_line_string':
      expected = 'array (LineString)';
      break;
    case 'geo_polygon':
      expected = 'array (Polygon)';
      break;
    case 'geo_geometry':
      expected = 'object (GeoJSON)';
      break;
  }

  return sandbox.translate('static.field_value_error', {
    name: field.name,
    alias: field.alias,
    value: `${value}`,
    expected,
  });
};

export const validateValues = (attributes, fields, sandbox, ErrorClass, errorPerfix, valueExtractor, valueOmitter) => {
  let errors = [];

  each(omitBy(attributes, isUndefined), (value, alias) => {
    const field = find(fields, { alias });
    if (!field) return errors.push(sandbox.translate('static.not_found_field_in_model', { field: alias }));

    const extracted = valueExtractor ? valueExtractor(field, value) : {};
    if (!isUndefined(extracted.value)) value = extracted.value;
    if (valueOmitter && valueOmitter(field, value, { ...extracted })) return;

    const valid = isFieldValueValid(field, value);
    if (!valid) errors.push(fieldValueError(field, value, sandbox));
  });

  if (errors.length) {
    if (errorPerfix) errors = errors.map((error) => `${errorPerfix}: ${error}`);
    const message = errors.join('\n');
    throw new ErrorClass(message);
  }
};
