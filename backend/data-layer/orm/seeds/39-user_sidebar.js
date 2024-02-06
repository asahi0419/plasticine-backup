export default {
  name: 'User sidebar',
  plural: 'User sidebars',
  alias: 'user_sidebar',
  type: 'core',
  template: 'base',
  access_script: 'true',
  order: '-100',
  __lock: ['delete'],
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
      required_when_script: 'true',
      options: { format: '^[a-zA-Z0-9_]+$' },
      __lock: ['delete'],
    },
    {
      name: 'Active?',
      alias: 'active',
      type: 'boolean',
      options: { default: true },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: { length: 10000, syntax_hl: 'json' },
      __lock: ['delete'],
    },
    {
      name: 'Condition script',
      alias: 'condition_script',
      type: 'condition',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Order',
      alias: 'order',
      type: 'integer',
      options: { default: 0 },
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
        columns: ['id', 'name', 'alias', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
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
