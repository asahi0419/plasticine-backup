export default {
  name: 'Tutorial article',
  plural: 'Tutorial articles',
  alias: 'tutorial_article',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Tutorial',
      alias: 'tutorial',
      type: 'reference',
      readonly_when_script: 'p.record.isPersisted()',
      required_when_script: 'true',
      options: { foreign_model: 'tutorial', foreign_label: 'name', extra_fields: ['permalink'] },
      __lock: ['delete'],
    },
    {
      name: 'Name',
      alias: 'name',
      type: 'string',
      required_when_script: 'true',
      options: { length: 250 },
      __lock: ['delete'],
    },
    {
      name: 'Permalink',
      alias: 'permalink',
      required_when_script: 'true',
      type: 'string',
      index: 'simple',
      options: { length: 400 },
      __lock: ['delete'],
    },
    {
      name: 'Path',
      alias: 'path',
      type: 'string',
      index: 'unique',
      required_when_script: 'true',
      readonly_when_script: 'true',
      options: { length: 1000 },
      __lock: ['delete'],
    },
    {
      name: 'Content',
      alias: 'content',
      type: 'string',
      options: { length: 500000, rows: 25, syntax_hl: 'editorjs' },
      __lock: ['delete'],
    },
    {
      name: 'Order',
      alias: 'order',
      type: 'integer',
      required_when_script: 'true',
      options: { default: 0},
      __lock: ['delete'],
    },
    {
      name: 'Access script',
      alias: 'access_script',
      type: 'condition',
      options: { length: 150000, syntax_hl: 'js', default: true },
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

const permalinks = [];

if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != $\{p.record.getValue('id')\}\`,
    fields: { [\`_$\{p.record.getModel().getValue('permalink')\}\`]: 'permalink' },
    page: { size: 999 },
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    lodash.each(result.data.data, ({ attributes = {} }) => permalinks.push(attributes.permalink));
  });
}

p.record.getField('name').onChange((oldValue, newValue) => {
  const permalinkValue = utils.parameterizeString(newValue, { length: 55, blackList: permalinks, isURL: true });
  p.record.setValue('permalink', permalinkValue);
});`,
      __lock: ['delete'],
    },
    {
      name: 'Autogeneration of path',
      order: '0',
      active: true,
      type: 'on_change',
      script: `if (p.record.isPersisted()) return;

const paths = [];

if (p.record.getModel && p.record.getModel().fetchRecords) {
  const params = {
    filter: \`\\\`id\\\` != \${p.record.getValue('id')}\`,
    fields: { [\`_\${p.record.getModel().getValue('path')}\`]: 'path' },
    page: { size: 999 }
  };
  p.record.getModel().fetchRecords(params).then((result) => {
    lodash.each(result.data.data, ({ attributes = {} }) => paths.push(attributes.path));
  });
}

p.record.getField('permalink').onChange((oldValue, newValue) => {
  const tutorial = p.record.getField('tutorial').getRefValue('permalink');
  const article = utils.parameterizeString(newValue, { length: 55, blackList: paths, isURL: true });
  p.record.setValue('path', \`/pages/tutorial/\${tutorial}/\${article}\`);
});

p.record.getField('tutorial').onChange((oldValue, newValue) => {
  const tutorial = p.record.getField('tutorial').getRefValue('permalink');
  const article = p.record.getValue('permalink');
  p.record.setValue('path', \`/pages/tutorial/\${tutorial}/\${article}\`);
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
        columns: ['id', 'name', 'permalink', 'order', 'path', 'created_at', 'updated_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'permalink', type: 'none' },
          { field: 'order', type: 'none' },
          { field: 'path', type: 'none' },
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
            'tutorial',
            '__column__.1_2',
            'permalink',
            'order',
            '__section__.2',
            'path',
            'access_script',
            'content',
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
