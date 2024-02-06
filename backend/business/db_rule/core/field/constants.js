export const DEFAULT_FIELD_PERMISSIONS = {
  primary_key: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
  ],
  autonumber: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
  ],
  integer: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  float: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  boolean: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  datetime: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  string: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  array_string: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  reference: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  reference_to_list: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  global_reference: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  fa_icon: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  color: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  file: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  filter: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  condition: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  data_template: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastRead()' },
  ],
  data_visual: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastRead()' },
  ],
  geo_point: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  geo_line_string: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  geo_polygon: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  geo_geometry: [
    { action: 'view', script: 'p.currentUser.canAtLeastRead()' },
    { action: 'update', script: 'p.currentUser.canAtLeastWrite()' },
  ],
  journal: [
    { action: 'create', script: 'p.currentUser.canAtLeastWrite()' },
    { action: 'update', script: 'false' },
    { action: 'delete', script: 'false' },
    { action: 'query', script: '' },
  ],
};
