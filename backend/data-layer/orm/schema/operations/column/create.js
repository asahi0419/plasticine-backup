import { SystemError } from '../../../../../business/error/index.js';
import { parseOptions } from '../../../../../business/helpers/index.js';

const CREATORS = {
  primary_key: createPrimaryKey,
  autoincrement: createAutoIncrement,
  autonumber: createAutoNumber,
  string: createString,
  datetime: createDateTime,
  reference: createReference,
  global_reference: createReference,
  boolean: createBoolean,
  integer: createInteger,
  float: createFloat,
  array_string: createArrayString,
  reference_to_list: createVirtualField,
  journal: createVirtualField,
  fa_icon: createFAIcon,
  file: createFileField,
  data_template: createDataTemplateField,
  data_visual: createDataVisualField,
  condition: createConditionField,
  filter: createFilterField,
  color: createColorField,
  geo_point: createGeoPoint,
  geo_line_string: createGeoLineString,
  geo_polygon: createGeoPolygon,
  geo_geometry: createGeoGeometry,
};

export default (table, field) => {
  if (!CREATORS[field.type]) throw new SystemError(`Wrong type for ${field.alias}`);

  CREATORS[field.type](table, field);

  return true;
};

function createPrimaryKey(table, field) {
  table.increments(field.alias).primary();
}

function createAutoIncrement(table, field) {
  table.string(field.alias);
}

function createString(table, field) {
  const { length = 255 } = parseOptions(field.options);

  if ((length <= 255) && (length !== 'unlimited')) {
    table.string(field.alias, length);
  } else {
    table.text(field.alias);
  }
}

function createAutoNumber(table, field) {
  const { length = 255 } = parseOptions(field.options);

  table.string(field.alias, length);
}

function createDateTime(table, field) {
  table.timestamp(field.alias, true).nullable();
}

function createReference(table, field) {
  table.integer(field.alias);
}

function createBoolean(table, field) {
  const options = parseOptions(field.options);

  table.boolean(field.alias).defaultTo(options.default);
}

function createInteger(table, field) {
  table.bigInteger(field.alias);
}

function createFloat(table, field) {
  table.double(field.alias);
}

function createArrayString(table, field) {
  table.string(field.alias);
}

function createVirtualField(table, field) {
}

function createFAIcon(table, field) {
  table.string(field.alias);
}

function createFileField(table, field) {
  table.string(field.alias);
}

function createDataTemplateField(table, field) {
  table.text(field.alias);
}

function createDataVisualField(table, field) {
  table.text(field.alias);
}

function createConditionField(table, field) {
  table.text(field.alias);
}

function createFilterField(table, field) {
  const { length = 150000 } = parseOptions(field.options);

  table.text(field.alias, length);
}

function createColorField(table, field) {
  const { length = 255 } = parseOptions(field.options);

  table.text(field.alias, length);
}

function createGeoPoint(table, field) {
  table.specificType(field.alias, 'geometry(POINT, 4326)');
}

function createGeoLineString(table, field) {
  table.specificType(field.alias, 'geometry(LINESTRING, 4326)');
}

function createGeoPolygon(table, field) {
  table.specificType(field.alias, 'geometry(POLYGON, 4326)');
}

function createGeoGeometry(table, field) {
  table.specificType(field.alias, 'geometry');
}
