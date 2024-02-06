import * as TYPES from './types';
import * as TYPES_EXTRA from './extra/types';

export const getComponent = (type, params = {}) => {
  return params.extra
    ? TYPES_EXTRA[type]
    : TYPES[type] || TYPES.string
};

// TODO: get types from server
export const getTypes = () => ({
  array_string: 'Array (string)',
  boolean: 'Boolean',
  datetime: 'Date/Time',
  integer: 'Integer',
  autonumber: 'Autonumber',
  float: 'Float',
  primary_key: 'Primary Key',
  reference: 'Reference',
  global_reference: 'Global reference',
  reference_to_list: 'Reference to list',
  string: 'String',
  journal: 'Journal',
  fa_icon: 'FA Icon',
  file: 'File',
  data_template: 'Data template',
  data_visual: 'Data visual',
  condition: 'Condition',
  filter: 'Filter',
  color: 'Color',
  geo_point: '[GEO] Point',
  geo_line_string: '[GEO] LineString',
  geo_polygon: '[GEO] Polygon',
  geo_geometry: '[GEO] Geometry',
})
