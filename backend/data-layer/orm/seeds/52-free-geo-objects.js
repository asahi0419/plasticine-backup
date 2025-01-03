export default {
  name: 'Free geo-object',
  plural: 'Free geo-objects',
  alias: 'free_geo_object',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  menu_visibility: 'p.currentUser.canAtLeastWrite()',
  order: '-100',
  __lock: [ 'delete' ],
  fields: [
    {
      name: 'Model ID',
      alias: 'model_id',
      type: 'reference',
      required_when_script: 'true',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
      },
      __lock: [ 'delete' ],
    },
    {
      name: 'Record ID',
      alias: 'record_id',
      type: 'integer',
      required_when_script: 'true',
      __lock: [ 'delete' ],
    },
    {
      name: 'Appearance ID',
      alias: 'appearance_id',
      type: 'reference',
      required_when_script: 'true',
      options: {
        foreign_model: 'appearance',
        foreign_label: 'id',
        filter: "`type` = 'map'",
      },
      __lock: [ 'delete' ],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      required_when_script: 'true',
      options: {
        values: {
          'geo_point': 'Point',
          'geo_line_string': 'LineString',
          'geo_polygon': 'Polygon',
        },
        default: 'geo_point',
      },
      __lock: ['delete'],
    },
    {
      name: 'Point',
      alias: 'geo_point',
      type: 'geo_point',
      required_when_script: "p.record.getValue('type') === 'geo_point'",
      hidden_when_script: "p.record.getValue('type') !== 'geo_point'",
      __lock: [ 'delete' ],
    },
    {
      name: 'Line',
      alias: 'geo_line_string',
      type: 'geo_line_string',
      required_when_script: "p.record.getValue('type') === 'geo_line_string'",
      hidden_when_script: "p.record.getValue('type') !== 'geo_line_string'",
      __lock: [ 'delete' ],
    },
    {
      name: 'Polygon',
      alias: 'geo_polygon',
      type: 'geo_polygon',
      required_when_script: "p.record.getValue('type') === 'geo_polygon'",
      hidden_when_script: "p.record.getValue('type') !== 'geo_polygon'",
      __lock: [ 'delete' ],
    },
    {
      name: 'Properties',
      alias: 'properties',
      type: 'string',
      options: {
        length: 100000,
        rows: 10,
        syntax_hl: 'json',
      },
      __lock: [ 'delete' ],
    },
    {
      name: 'End A',
      alias: 'end_a',
      type: 'geo_point',
      hidden_when_script: "p.record.getValue('type') !== 'geo_line_string'",
      __lock: ['delete'],
    },
    {
      name: 'End mark A',
      alias: 'end_mark_a',
      type: 'string',
      __lock: ['delete'],
    },
    {
      name: 'End mark B',
      alias: 'end_mark_b',
      type: 'string',
      __lock: ['delete'],
    },
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      layout: 'Default',
      filter: 'Default',
      __lock: [ 'delete' ],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: [
          'id',
          'model_id',
          'record_id',
          'appearance_id',
          'type',
          'created_at',
          'created_by',
        ],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'model_id', type: 'none' },
          { field: 'record_id', type: 'none' },
          { field: 'appearance_id', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: [ 'delete' ],
    },
  ],
  forms: [
    {
      name: 'Default',
      alias: 'default',
      order: 0,
      active: true,
      condition_script: 'true',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'model_id',
            'type',
            '__column__.1_2',
            'record_id',
            'appearance_id',
            '__section__.2',
            '__column__.2_1',
            'geo_line_string',
            '__column__.2_2',
            'end_a',
            '__section__.3',
            'geo_point',
            'geo_polygon',
            'properties',
            '__tab__.service',
            '__section__.4',
            'id',
            '__section__.5',
            '__column__.5_1',
            'created_at',
            'updated_at',
            '__column__.5_2',
            'created_by',
            'updated_by',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: [ 'delete' ],
    },
  ],
  permissions: [
    { type: 'model', action: 'query', script: "TRUE = 'js:p.currentUser.canAtLeastRead()'", __lock: ['delete'] },
    { type: 'model', action: 'create', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'define_layout', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'model', action: 'define_filter', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'attachment', action: 'view', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'attachment', action: 'create', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'attachment', action: 'create_photo', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'attachment', action: 'delete', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
  ],
  privileges: [
    { level: 'admin', owner_type: 'user_group', owner_id: '__core', __lock: ['delete'] },
  ],
};
