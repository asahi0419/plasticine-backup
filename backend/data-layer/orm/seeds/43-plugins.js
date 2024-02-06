export default {
  name: 'Plugin',
  plural: 'Plugins',
  alias: 'plugin',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  audit: 'none',
  __lock: ['delete'],
  fields: [
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      options: { length: 60 },
      required_when_script: 'true',
      readonly_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Alias',
      alias: 'alias',
      type: 'string',
      index: 'unique',
      options: { format: '^[a-z_][a-z0-9_]{1,}$', length: 60 },
      required_when_script: 'true',
      readonly_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Description',
      alias: 'description',
      type: 'string',
      options: { length: 150000 },
      readonly_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: { length: 10000, syntax_hl: 'json' },
      readonly_when_script: `p.record.getValue('status') === 'inactive'`,
      __lock: ['delete'],
    },
    {
      name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          active: 'Active',
          inactive: 'Inactive',
        },
        default: 'inactive',
      },
      required_when_script: 'true',
      readonly_when_script: 'true',
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
        columns: ['id', 'name', 'alias', 'status', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'updated_by', type: 'none' },
        ],
        wrap_text: false,
        cell_editing: false,
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
      condition_script: 'p.currentUser.isAdmin()',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'name',
            '__column__.1_2',
            'status',
            '__section__.2',
            'options',
            'description',
            '__tab__.service',
            '__section__.3',
            '__column__.3_1',
            'id',
            '__column__.3_2',
            'alias',
            '__section__.4',
            '__column__.4_1',
            'created_at',
            'updated_at',
            '__column__.4_2',
            'created_by',
            'updated_by',
            '__attachments__',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
            '__attachments__': { name: 'Attachments', last_versions_view: 'last_versions' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: ['delete'],
    },
  ],
  actions: [
    {
      name: 'Update',
      alias: 'update',
      type: 'form_button',
      position: '-100',
      on_update: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  record.assignAttributes(params.record);
  await record.save({ systemActions: params.system_actions });

  p.actions.goBack();
} catch(error) {
  p.response.error(error)
}`,
      condition_script: `p.currentUser.canUpdate() && (p.record.getValue('status') === 'active')`,
      active: true,
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'false', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'false', __lock: ['delete'] },
  ],
};
