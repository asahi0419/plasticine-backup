export default {
  name: 'Chart',
  plural: 'Charts',
  alias: 'chart',
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
      __lock: ['delete']
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
      name: 'Data source',
      alias: 'data_source',
      type: 'reference',
      required_when_script: 'true',
      options: { foreign_model: 'model', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'Client script',
      alias: 'client_script',
      type: 'string',
      required_when_script: 'true',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Server script',
      alias: 'server_script',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Filter',
      alias: 'filter',
      type: 'filter',
      options: { length: 150000 },
      __lock: ['delete'],
    },
    {
      name: 'AmCharts version',
      alias: 'version',
      type: 'array_string',
      options: {
        values: { v4: 'v.4', v5: 'v.5' },
        default: 'v4',
      },
      required_when_script: 'true',
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
            'data_source',
            '__column__.1_2',
            'alias',
            'version',
            '__section__.2',
            'client_script',
            'server_script',
            'filter',
            '__chart__',
            '__tab__.service',
            '__section__.4',
            'id',
            '__section__.5',
            '__column__.5_1',
            'created_at',
            'updated_at',
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
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: [
          'id',
          'name',
          'alias',
          'data_source',
          'created_at',
          'updated_at',
          'created_by',
          'updated_by',
        ],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'data_source', type: 'none' },
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
  ui_rules: [
    {
      name: 'Set default scripts',
      order: '0',
      active: true,
      type: 'on_load',
      script: `if (!p.record.isPersisted()){
  const clientScript = p.record.getField('client_script');
  const serverScript = p.record.getField('server_script');
  const versionVal = p.record.getField('version');

  if (versionVal === 'v4') {
    clientScript.setValue(\`function(chartdiv, scope) {

  const chart = am4core.create(chartdiv, am4charts.XYChart);

  chart.data = scope.main;

  return chart;
}\`);
  } else if (versionVal === 'v5') {
    clientScript.setValue(\`function(chartdiv, scope) {
  const root = am5.Root.new(chartdiv);
  root.setThemes([ am5themes_Animated.new(root) ]);

  const data = scope.main;

  return root;
}\`);
  }

  serverScript.setValue(\`async function(scope) {
  const records = await p.iterMap(scope.find({}), record => record.attributes);

  return {
    main: records
  };
}\`);
}`,
      __lock: ['delete'],
    },
    {
      name: 'Set filter field',
      order: '0',
      active: true,
      type: 'on_load',
      script: `const dataSource = p.record.getValue('data_source');
const filterField = p.record.getField('filter');

if (dataSource) filterField.setOptions({ ref_model: dataSource });`,
      __lock: ['delete'],
    },
    {
      name: 'Update filter field',
      order: '0',
      active: true,
      type: 'on_change',
      script: `const dataSourceField = p.record.getField('data_source');
const filterField = p.record.getField('filter');

dataSourceField.onChange((oldValue, newValue) => {
  if (newValue) filterField.setOptions({ ref_model: newValue });
  filterField.setValue('');
});`,
      __lock: ['delete'],
    },
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
    {
      name: 'Update default scripts',
      order: '0',
      active: true,
      type: 'on_change',
      script: `p.record.getField('version').onChange((oldValue, newValue) => {
  if (!confirm(p.translate('static.chart_default_client_script'))) {
    return false;
  }
  const clientScript = p.record.getField('client_script');
  if (newValue === 'v4') {
    clientScript.setValue(\`function(chartdiv, scope) {

  const chart = am4core.create(chartdiv, am4charts.XYChart);

  chart.data = scope.main;

  return chart;
}\`);
  } else if (newValue === 'v5') {
    clientScript.setValue(\`function(chartdiv, scope) {
  const root = am5.Root.new(chartdiv);
  root.setThemes([ am5themes_Animated.new(root) ]);

  const data = scope.main;

  return root;
}\`);
  }
});`,
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
