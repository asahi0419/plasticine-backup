export default {
  name: 'Geo-object property',
  plural: 'Geo-object properties',
  alias: 'geo_object_property',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  menu_visibility: 'p.currentUser.canAtLeastWrite()',
  order: '-100',
  __lock: [ 'delete' ],
  fields: [
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      required_when_script: 'true',
      hint: 'static.geo_object_property_name_hint',
      __lock: [ 'delete' ],
    },
    {
      name: 'Model ID',
      alias: 'model_id',
      type: 'reference',
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
      readonly_when_script: "!p.record.getValue('model_id')",
      __lock: [ 'delete' ],
    },
    {
      name: 'Appearance ID',
      alias: 'appearance_id',
      type: 'reference',
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
      name: 'Category',
      alias: 'category',
      type: 'array_string',
      options: {
        values: {
          'associated_geo_data': 'Associated geo-data',
          'free_geo_data': 'Free geo-data',
          'other_data': 'Other geo-data',
        },
        default: 'associated_geo_data',
      },
      __lock: ['delete'],
    },
    {
      name: 'Associated model',
      alias: 'associated_model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
      },
      required_when_script: "p.record.getValue('category') === 'associated_geo_data'",
      hidden_when_script: "p.record.getValue('category') !== 'associated_geo_data'",
      __lock: [ 'delete' ],
    },
    {
      name: 'Condition',
      alias: 'condition_associated',
      type: 'condition',
      options: {
        ref_model: 'associated_model',
        length: 150000,
        syntax_hl: 'js',
        default: 'true',
      },
      hidden_when_script: "p.record.getValue('category') !== 'associated_geo_data'",
      __lock: ['delete'],
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
          'name',
          'model_id',
          'record_id',
          'appearance_id',
          'type',
          'category',
          'associated_model',
          'created_at',
          'created_by',
        ],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'model_id', type: 'none' },
          { field: 'record_id', type: 'none' },
          { field: 'appearance_id', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'category', type: 'none' },
          { field: 'associated_model', type: 'none' },
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
            'name',
            'model_id',
            'type',
            'category',
            '__column__.1_2',
            'record_id',
            'appearance_id',
            'associated_model',
            '__section__.2',
            'condition_associated',
            'properties',
            '__tab__.service',
            '__section__.3',
            'id',
            '__section__.4',
            '__column__.4_1',
            'created_at',
            'updated_at',
            '__column__.4_2',
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
  ui_rules: [
    {
      name: 'On Change Category',
      order: 0,
      active: true,
      type: 'on_change',
      script: `p.record.getField('category').onChange((oldValue, newValue) => {
  setConditionAssociated(newValue)
});

function setConditionAssociated(type) {
  let value = '';

  switch (type) {
    case 'associated_geo_data':
      value = 'true'
      break;
  }

  p.record.setValue('condition_associated', value);
}`,
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
