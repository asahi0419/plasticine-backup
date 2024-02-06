export default {
  name: 'Form',
  plural: 'Forms',
  alias: 'form',
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
      options: { foreign_model: 'model', foreign_label: 'name' },
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
      name: 'Show `name` as form header',
      alias: 'use_form_name',
      type: 'boolean',
      options: { default: false },
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
      name: 'Form title',
      alias: 'title',
      type: 'string',
      options: { default: '#{id}' },
      __lock: ['delete'],
    },
    {
      name: 'Order',
      alias: 'order',
      type: 'integer',
      options: { default: 0 },
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
      name: 'Condition script',
      alias: 'condition_script',
      type: 'condition',
      options: { ref_model: 'model', length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Page',
      alias: 'page',
      type: 'reference',
      options: { foreign_model: 'page', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: {
        length: 10000,
        syntax_hl: 'json',
        default: {
          components: { list: [], options: {} },
          related_components: { list: [], options: {} }
        },
      },
      __lock: ['delete'],
    },
    {
      name: 'Tutorial',
      alias: 'tutorial',
      type: 'string',
      options: {
        length: 10000,
        rows: 1,
      },
      __lock: ['delete'],
    },
    {
      name: 'Label position',
      alias: 'label_position',
      type: 'array_string',
      options: {
        values: {
          left: 'Left',
          top: 'Top',
        },
        default: 'left',
      },
      __lock: ['delete'],
    },
    {
      name: 'Show rel lists as tabs',
      alias: 'show_rel_lists_as_tabs',
      type: 'boolean',
      options: { default: true },
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
        columns: ['id', 'name', 'alias', 'order', 'active', 'created_at', 'updated_at', 'model'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'order', type: 'none' },
          { field: 'active', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'model', type: 'none' },
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
            'order',
            '__column__.1_2',
            'alias',
            'active',
            '__form_items_chooser__',
            '__section__.2',
            'condition_script',
            '__section__.3',
            '__column__.3_1',
            'title',
            'label_position',
            '__column__.3_2',
            'use_form_name',
            'model',
            '__section__.4',
            'tutorial',
            '__tab__.related_data',
            '__related_data_chooser__',
            '__section__.5',
            '__column__.5_1',
            'show_rel_lists_as_tabs',
            '__tab__.service',
            '__section__.6',
            'id',
            '__section__.7',
            '__column__.7_1',
            'created_at',
            'updated_at',
            '__column__.7_2',
            'created_by',
            'updated_by'
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.related_data': { name: 'Related data' },
            '__tab__.service': { name: 'Service'}
          },
        },
        related_components: {
          list: [],
          options: {},
        }
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
