export default {
  name: 'Web service',
  plural: 'Web services',
  alias: 'web_service',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    { name: 'Name', alias: 'name', type: 'string', required_when_script: 'true', __lock: ['delete'] },
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
      name: 'Description',
      alias: 'description',
      type: 'string',
      options: { length: 1000 },
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: { values: { rest: 'REST' }, default: 'rest' },
      required_when_script: 'true',
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
      name: 'Access script',
      alias: 'access_script',
      type: 'condition',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Script',
      alias: 'script',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Category',
      alias: 'category',
      type: 'array_string',
      options: { values: { custom: 'Custom', core: "Core" }, default: 'custom' },
      required_when_script: 'true',
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
      name: 'Custom WS',
      alias: 'custom_ws',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Default',
      filter: 'Custom',
      order: 200,
      __lock: ['delete'],
    },
    {
      name: 'Core WS',
      alias: 'core_ws',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Default',
      filter: 'Core',
      order: 100,
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'name', 'alias', 'type', 'category', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
          { field: 'type', type: 'none' },
          { field: 'category', type: 'none' },
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
      order: 200,
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
            '__column__.1_2',
            'alias',
            'active',
            '__section__.2',
            'script',
            'access_script',
            'description',
            '__tab__.service',
            '__section__.3',
            '__column__.3_1',
            'id',
            'created_at',
            'updated_at',
            '__column__.3_2',
            'category',
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
  filters: [
    {
      name: 'Custom',
      query: "`category` = 'custom'",
    },
    {
      name: 'Core',
      query: "`category` = 'core'",
    },
  ],
  records: [
    {
      name: 'Get MC Application',
      alias: 'get_mc_application',
      category: 'core',
      access_script: '!!p.getRequest()?.__headers["app-os"]',
      description: 'To be able to request file to auto update MC',
      script: `try {
        const { auto_update_version_name_android, auto_update_version_name_ios } =
          p.getRequest();
      
        const versionName =
          auto_update_version_name_android || auto_update_version_name_ios;
      
        if (!versionName)
          throw new Error(\`auto_update_version_name_(os) param is expected\`);
      
        const setting_name = 'mc';
      
        const setting_model = (await p.getModel('setting')).setOptions({
          check_permission: { all: false },
        });
        const setting_record = await setting_model.findOne({ alias: setting_name });
        if (!setting_record) throw new Error(\`No \${setting_name} setting found\`);
      
        const files = await setting_record.getAttachments();
        const file = lodash.find(files, (attach) =>
          attach.getValue('file_name').includes(versionName)
        );
      
        if (!file)
          throw new Error(\`No attached file found for versionName: \${versionName}\`);
      
        const data = await file.getBuffer();
      
        p.response.response.writeHead(200, {
          'Content-Type': 'application/octet-stream',
          'Content-Length': data.length,
          'Content-Disposition': \`attachment; filename=\${file.getValue('file_name')}\`,
        });
      
        p.response.response.end(data);
      } catch (e) {
        p.log.error(e);
        p.response.error(e);
      }`,
      __lock: ['delete'],
      __lock_fields: "alias != 'active'",
    },
    {
      name: 'Topology. Update Topology data',
      alias: 'update_topology_data',
      description: 'To be able to manipulate with Topology data records by end user in security way',
      active: true,
      access_script: '!p.currentUser.isGuest()',
      category: 'core',
      type: 'rest',
      script: `try {
  let { topologyDataId, attributes } = p.getRequest();
  attributes = JSON.parse(attributes);

  const dataModel = (await p.getModel('topology_data')).setOptions( {'check_permission': { 'all': false }});
  let dataRecord;
  let { data } = attributes;

  processToFloat(data);

  if (topologyDataId) { // update
    dataRecord = await dataModel.findOne({id: topologyDataId});
    if (!dataRecord) throw new Error(\`No Topology Data \${topologyDataId} found\`);
    
    await dataRecord.update({ data });
  } else { // create
    processToInt(attributes);
    dataRecord = await dataModel.insert(attributes);
  }

  p.response.json({"id": dataRecord.id});
} catch(e) {
  p.log.error(e);
  p.response.error(e);
}

function processToFloat(data) {
  for (let id in data) {
    data[id] = [parseFloat(data[id][0]), parseFloat(data[id][1])];
  }
}

function processToInt(attributes) {
  for (let col of ['view_id', 'model_id', 'record_id', 'appearance_id']) {
    if (attributes[col]) attributes[col] = parseInt(attributes[col]);
  }
}`,
      __lock: ['delete'],
      __lock_fields: "alias != 'active'",
    },
  ],
};
