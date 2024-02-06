export default {
  name: 'Extra fields attribute',
  plural: 'Extra fields attributes',
  alias: 'extra_fields_attribute',
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
      options: { length: 52 },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Alias',
      alias: 'alias',
      type: 'string',
      index: 'unique',
      required_when_script: 'true',
      options: { format: '^[a-zA-Z0-9_]+$' },
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          attachments: 'Attachments',
          comments: 'Comments'
        },
        default: 'attachments'
      },
      required_when_script: 'true',
      readonly_when_script: `p.record.isPersisted()`,
      __lock: ['delete'],
    },
    {
      name: 'Readonly',
      alias: 'readonly_when_extra',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Hidden',
      alias: 'hidden_when_extra',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Required',
      alias: 'required_when_extra',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: { length: 10000, syntax_hl: 'json' },
      __lock: ['delete'],
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
    filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
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
        columns: ['id', 'name', 'alias', 'type', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'type', type: 'none' },
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
            'alias',
            '__column__.1_2',
            'type',
            '__section__.2',
            '__column__.2_1',
            'options',
            'readonly_when_extra',
            '__column__.2_2',
            'required_when_extra',
            'hidden_when_extra',
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
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
