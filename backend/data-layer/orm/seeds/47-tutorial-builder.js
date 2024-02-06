export default {
  name: 'Tutorial',
  plural: 'Tutorials',
  alias: 'tutorial',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      required_when_script: 'true',
      options: { length: 100 },
      __lock: ['delete'],
    },
    {
      name: 'Permalink',
      alias: 'permalink',
      type: 'string',
      required_when_script: 'true',
      index: 'unique',
      options: { length: 128 },
      __lock: ['delete'],
    },
    {
      name: 'Description',
      alias: 'description',
      type: 'string',
      options: { length: 5000, rows:5 },
      __lock: ['delete'],
    },
    {
      name: 'Access script',
      alias: 'access_script',
      type: 'condition',
      options: { default: 'p.currentUser.canAtLeastRead()' },
      __lock: ['delete'],
    }
  ],
  ui_rules: [
    {
      name: 'Autogeneration of permalink',
      order: '0',
      active: true,
      type: 'on_change',
      script: `if (p.record.isPersisted()) return;
let permalinks = [];
if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('permalink')\}\`]: 'permalink' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    permalinks = result.data.data.map(({ attributes }) => attributes.permalink);
  });
}
p.record.getField('name').onChange((oldValue, newValue) => {
  const permalinkValue = utils.parameterizeString(newValue, { length: 55, blackList: permalinks, isURL:true });
  p.record.setValue('permalink', permalinkValue);
});`,
      __lock: ['delete'],
    },
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'p.currentUser.canAtLeastRead()',
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
        columns: ['id', 'name', 'permalink', 'access_script', 'created_at', 'updated_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'permalink', type: 'none' },
          { field: 'access_script', type: 'none' },
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
            'name',
            '__column__.1_2',
            'permalink',
            '__section__.2',
            'access_script',
            'description',
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
