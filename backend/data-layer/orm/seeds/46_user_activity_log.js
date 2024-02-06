export default {
  name: 'User Activity Log',
  plural: 'User Activity Logs',
  alias: 'user_activity_log',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Session',
      alias: 'session',
      type: 'reference',
      readonly_when_script: 'p.record.isPersisted()',
      options: { foreign_model: 'session', foreign_label: 'ip_address' },
      __lock: ['delete'],
    },
    {
      name: 'Activity',
      alias: 'activity',
      type: 'array_string',
      options: {
        values: {
          view: 'View',
          form: 'Form',
          page: 'Page',
          dashboard: 'Dashboard',
        },
        default: 'new'
      },
      __lock: ['delete'],
    },
    {
      name: 'Object Alias',
      alias: 'object_alias',
      type: 'string',
      __lock: ['delete'],
    },
    {
      name: 'URL',
      alias: 'url',
      type: 'string',
      options: { length: 4000 },
      __lock: ['delete'],
    },
    {
      name: 'Path',
      alias: 'path',
      type: 'string',
      options: { length: 2000 },
      __lock: ['delete'],
    },
    {
      name: 'User',
      alias: 'created_by',
      type: 'reference',
      options: { foreign_model: 'user', foreign_label: 'account' },
      __lock: ['delete'],
    }
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
        columns: ['id', 'created_by', 'session', 'activity', 'object_alias', 'created_at', 'updated_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'created_by', type: 'none' },
          { field: 'session', type: 'none' },
          { field: 'activity', type: 'none' },
          { field: 'object_alias', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' }
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
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
            'created_by',
            'activity',
            'session',
            '__column__.1_2',
            'created_at',
            'object_alias',
            '__section__.2',
            'url',
            '__tab__.service',
            '__section__.3',
            'id',
            'path',
            '__section__.4',
            '__column__.4_1',
            'updated_at',
            '__column__.4_2',
            'updated_by',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: ['delete'],
    },
  ],
  actions: [
    {
      name: 'Open object',
      alias: 'open_object',
      type: 'form_field',
      position: '-100',
      on_update: true,
      client_script: 'const redirectWindow = window.open(`${p.record.getValue(\'path\')}`, \'_blank\');\n' +
        'redirectWindow.location;\n' +
        'return false;',
      condition_script: 'p.currentUser.canAtLeastRead()',
      active: true,
      options: {
        field_related: "path",
        icon : "external url sign icon"
      },
      __lock: ['delete'],
    }
    ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
