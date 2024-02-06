export default {
  name: 'Appearance',
  plural: 'Appearances',
  alias: 'appearance',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
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
      name: 'Name',
      alias: 'name',
      type: 'string',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: { values: { grid: 'Grid', map: 'Map', calendar: 'Calendar', topology: 'Topology Diagram' }},
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Script',
      alias: 'script',
      type: 'string',
      options: {
        length: 150000,
        syntax_hl: 'js'
      },
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: {
        length: 10000,
        syntax_hl: 'json',
      },
      __lock: ['delete'],
    },
    {
      name: 'Geo metadata',
      alias: 'geo_metadata',
      type: 'reference_to_list',
      options: {
        foreign_model: 'geo_metadata',
        foreign_label: 'name',
      },
      __lock: ['delete'],
    },
    {
      name: 'Drawing condition',
      alias: 'drawing',
      type: 'condition',
      options: {
        length: 150000,
        syntax_hl: 'js',
        default: `return (() => {
  let result = false;
  // ability to work with fields of the parent form for embedded views, pls customize for your needs
  /*
  if (p.parentRecord) {
    if (p.parentRecord.getValue('status') != 'closed') {
      result = true;
    }
  }
  */
  return result;
})();`
      },
      __lock: ['delete'],
    },
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Default',
      filter: 'Default',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'model', 'name', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'model', type: 'none' },
          { field: 'name', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'created_by', type: 'none' },
          { field: 'updated_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
