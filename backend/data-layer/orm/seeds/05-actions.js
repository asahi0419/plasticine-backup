export default {
  name: 'Action',
  plural: 'Actions',
  alias: 'action',
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
      name: 'Alias',
      alias: 'alias',
      type: 'string',
      index: 'unique',
      options: {
        composite_index: ['model'],
        format: '^[a-zA-Z0-9_]+$',
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          form_button: 'Form button',
          form_menu_item: 'Form menu item',
          view_button: 'View button',
          view_menu_item: 'View menu item',
          view_choice: 'View choice',
          context_menu: 'Context menu',
          dashboard_button: 'Dashboard button',
          card_view: 'Card view',
          header: 'Header',
          user_sidebar: 'User sidebar',
          form_field: 'Form field',
          map_item: 'Map item',
          map_item_context: 'Map item context',
          map_item_tip: 'Map item tip',
          map_draw: 'Map draw',
          topology_item: 'Topology item',
          topology_item_context: 'Topology item context',
          calendar_action: 'Calendar action',
        },
        length: 2048,
      },
      required_when_script: "!!p.record.getValue('model')",
      __lock: ['delete'],
    },
    {
      name: 'Position',
      alias: 'position',
      type: 'integer',
      options: {
        default: 0,
      },
      __lock: ['delete'],
    },
    {
      name: 'Active?',
      alias: 'active',
      type: 'boolean',
      options: {
        default: true,
      },
      __lock: ['delete'],
    },
    {
      name: 'Group',
      alias: 'group',
      type: 'boolean',
      options: {
        default: false,
      },
      __lock: ['delete'],
    },
    {
      name: 'Insert',
      alias: 'on_insert',
      type: 'boolean',
      options: {
        default: false,
      },
      readonly_when_script: `p.record.getValue('group')`,
      hidden_when_script: `!['form_button', 'form_menu_item', 'form_field', 'context_menu'].includes(p.record.getValue('type'))`,
      __lock: ['delete'],
    },
    {
      name: 'Update',
      alias: 'on_update',
      type: 'boolean',
      options: {
        default: false,
      },
      readonly_when_script: `p.record.getValue('group')`,
      hidden_when_script: `!['form_button', 'form_menu_item', 'form_field', 'context_menu'].includes(p.record.getValue('type'))`,
      __lock: ['delete'],
    },
    {
      name: 'Client script',
      alias: 'client_script',
      type: 'string',
      options: {
        length: 150000,
        syntax_hl: 'js',
      },
      readonly_when_script: "p.record.getValue('group')",
      __lock: ['delete'],
    },
    {
      name: 'Response script',
      alias: 'response_script',
      type: 'string',
      options: {
        length: 150000,
        syntax_hl: 'js',
      },
      __lock: ['delete'],
    },
    {
      name: 'Server script',
      alias: 'server_script',
      type: 'string',
      options: {
        length: 150000,
        syntax_hl: 'js',
      },
      required_when_script: `!p.record.getValue('group') && !p.record.getValue('client_script')`,
      readonly_when_script: "p.record.getValue('group')",
      __lock: ['delete'],
    },
    {
      name: 'Condition script',
      alias: 'condition_script',
      type: 'condition',
      options: {
        ref_model: 'model',
        length: 150000,
        syntax_hl: 'js',
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
      name: 'Hint',
      alias: 'hint',
      type: 'string',
      options: {
        length: 512,
      },
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
    {
      name: 'Type check for actions',
      order: '1',
      active: true,
      type: 'on_change',
      script: `
      p.record.getField('type').onChange((oldValue, newValue) => {
        if (newValue !== 'form_button' && newValue !== 'context_menu' && newValue !== 'form_field') {
           p.record.getField('on_insert').setValue(false)
           p.record.getField('on_update').setValue(false)
        }
      });`,
      __lock: ['delete'],
    },
  ],
  records: [{
    name: 'On Client Request',
    alias: '__on_client_request',
    active: false,
    server_script: '',
    condition_script: 'true',
  }],
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
        columns: ['id', 'name', 'alias', 'type', 'model', 'active', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'model', type: 'none' },
          { field: 'active', type: 'none' },
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
            'type',
            'on_insert',
            'on_update',
            '__column__.1_2',
            'alias',
            'active',
            'group',
            'position',
            '__section__.2',
            'server_script',
            'response_script',
            'client_script',
            'condition_script',
            'options',
            '__section__.3',
            'model',
            '__tab__.service',
            '__section__.4',
            'id',
            '__section__.5',
            '__column__.5_1',
            'created_at',
            'updated_at',
            'hint',
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
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
