export default {
  name: 'Geo metadata',
  plural: 'Geo metadata',
  alias: 'geo_metadata',
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
      __lock: ['delete'],
    },
    {
      name: 'Alias',
      alias: 'alias',
      type: 'string',
      index: 'unique',
      options: {
        composite_index: ['model'],
        format: '^[a-zA-Z0-9_]+$',
        length: 60,
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Model',
      alias: 'model',
      type: 'reference',
      options: {
        foreign_model: 'model',
        foreign_label: 'name',
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'View',
      alias: 'view',
      type: 'reference',
      options: {
        foreign_model: 'view',
        foreign_label: 'name',
        depends_on: ['model'],
      },
      __lock: ['delete'],
    },
    {
      name: 'Line by',
      alias: 'line_by',
      type: 'array_string',
      options: {
        values: {
          path: 'Path',
          point_ab: 'Point A/B',
        },
        default: 'path',
      },
      hint: 'static.geo_metadata_line_by_hint',
      __lock: ['delete'],
    },
    {
      name: 'Label',
      alias: 'label',
      type: 'string',
      options: {
        length: 1024,
      },
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          Point: 'Point',
          LineString: 'LineString',
        },
        default: 'Point',
      },
      __lock: ['delete'],
    },
    {
      name: 'Point A field',
      alias: 'point_a',
      type: 'reference',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        depends_on: ['model'],
        filter: "`type` IN ('reference', 'geo_point', 'geo_line_string', 'geo_polygon', 'geo_geometry')",
      },
      required_when_script: `(p.record.getValue('line_by') === 'point_ab') || (p.record.getValue('type') === 'Point')`,
      readonly_when_script: `(p.record.getValue('line_by') === 'path') && (p.record.getValue('type') === 'LineString')`,
      __lock: ['delete'],
    },
    {
      name: 'Point A field meta ref',
      alias: 'point_a_ref',
      type: 'reference',
      options: {
        foreign_model: 'geo_metadata',
        foreign_label: 'name',
      },
      required_when_script: `p.record.getField('point_a').getValue('type') === 'reference'`,
      readonly_when_script: `(p.record.getValue('line_by') === 'path') && (p.record.getValue('type') === 'LineString')`,
      __lock: ['delete'],
    },
    {
      name: 'Point B field',
      alias: 'point_b',
      type: 'reference',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        depends_on: ['model'],
        filter: "`type` IN ('reference', 'geo_point', 'geo_line_string', 'geo_polygon', 'geo_geometry')",
      },
      required_when_script: `(p.record.getValue('line_by') === 'point_ab') && (p.record.getValue('type') === 'LineString')`,
      readonly_when_script: `(p.record.getValue('line_by') === 'path') || (p.record.getValue('type') === 'Point')`,
      __lock: ['delete'],
    },
    {
      name: 'Point B field meta ref',
      alias: 'point_b_ref',
      type: 'reference',
      options: {
        foreign_model: 'geo_metadata',
        foreign_label: 'name',
      },
      required_when_script: `p.record.getField('point_b').getValue('type') === 'reference'`,
      readonly_when_script: `(p.record.getValue('line_by') === 'path') || (p.record.getValue('type') === 'Point')`,
      __lock: ['delete'],
    },
    {
      name: 'Path field',
      alias: 'path',
      type: 'reference',
      options: {
        foreign_model: 'field',
        foreign_label: 'name',
        depends_on: ['model'],
        filter: "`type` = 'geo_line_string'",
      },
      readonly_when_script: `p.record.getValue('type') === 'Point'`,
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
          'name',
          'alias',
          'model',
          'view',
          'line_by',
          'type',
          'point_a',
          'point_b',
          'path',
          'created_at',
          'created_by',
        ],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'model', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'point_a', type: 'none' },
          { field: 'point_b', type: 'none' },
          { field: 'path', type: 'none' },
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
            'model',
            'type',
            'point_a',
            'point_b',
            'path',
            '__column__.1_2',
            'alias',
            'view',
            'line_by',
            'point_a_ref',
            'point_b_ref',
            'label',
            '__tab__.service',
            '__section__.2',
            'id',
            '__section__.3',
            '__column__.3_1',
            'created_at',
            'updated_at',
            '__column__.3_2',
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
      name: 'Autogeneration of alias',
      order: '0',
      active: true,
      type: 'on_change',
      script: `if (p.record.isPersisted()) return;
let aliases = [];
if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`model\\\` = $\{p.record.getValue('model')\} AND \\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('alias')\}\`]: 'alias' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    aliases = result.data.data.map(({ attributes }) => attributes.alias);
  });
}
p.record.getField('name').onChange((oldValue, newValue) => {
  const aliasValue = utils.parameterizeString(newValue, { length: 55, blackList: aliases });
  p.record.setValue('alias', aliasValue);
});`,
      __lock: ['delete'],
    },
  ],
  privileges: [
    { level: 'admin', owner_type: 'user_group', owner_id: '__core', __lock: ['delete'] },
  ],
};
