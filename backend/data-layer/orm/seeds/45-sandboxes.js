export default {
  name: 'Sandbox',
  plural: 'Sandbox',
  alias: 'sandbox',
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
      options: { length: 255 },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Script',
      alias: 'script',
      type: 'string',
      options: { length: 'unlimited', rows: 20, syntax_hl: 'js' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Result',
      alias: 'result',
      type: 'string',
      options: { length: 'unlimited', rows: 15, syntax_hl: 'json' },
      __lock: ['delete'],
    },
    {
      name: 'Expected result',
      alias: 'exp_result',
      type: 'string',
      options: { length: 'unlimited', rows: 15, syntax_hl: 'json' },
      __lock: ['delete'],
    },
    {
      name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          ok: 'OK',
          pass: 'PASS',
          not_pass: 'NOT PASS',
          error: 'ERROR',
        },
      },
      __lock: ['delete'],
    },
    {
      name: 'Message',
      alias: 'message',
      type: 'string',
      options: { length: 'unlimited', rows: 5 },
      hidden_when_script: "!p.record.getValue('message')",
      __lock: ['delete'],
    },
    {
      name: 'Tag',
      alias: 'tag',
      type: 'string',
      options: { length: 255 },
      __lock: ['delete'],
    },
    {
      name: 'Exec time (ms)',
      alias: 'exec_time',
      type: 'integer',
      __lock: ['delete'],
    },
    {
      name: 'Timeout (ms)',
      alias: 'timeout',
      type: 'integer',
      options: { default: 60000, min: 1 },
      __lock: ['delete'],
    },
    {
      name: 'Order',
      alias: 'order',
      type: 'integer',
      options: { default: 0 },
      __lock: ['delete']
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
        columns: ['id', 'name', 'tag', 'order', 'status', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'tag', type: 'none' },
          { field: 'order', type: 'none' },
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
            'name',
            '__section__.2',
            '__column__.2_1',
            'script',
            '__section__.3',
            '__column__.3_1',
            'result',
            '__column__.3_2',
            'exp_result',
            '__section__.4',
            'message',
            '__section__.5',
            'status',
            '__section__.6',
            '__column__.6_1',
            'tag',
            'order',
            '__column__.6_2',
            'exec_time',
            'timeout',
            '__tab__.service',
            '__section__.7',
            'id',
            '__section__.8',
            '__column__.8_1',
            'created_at',
            'updated_at',
            '__column__.8_2',
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
  actions: [
    {
      name: 'Run',
      alias: 'run',
      type: 'form_button',
      position: '100',
      on_insert: true,
      on_update: true,
      server_script: `//#script_timeout: 604800000
const params = p.getRequest();

try {
  const record = await params.getRecord();
  if (!record) throw new Error('Record not found');

  const result = await utils.execSS(params.record.script, { exp_result: params.record.exp_result, timeout: params.record.timeout });
  p.actions.openForm(record.model.alias, await record.update({ ...params.record, ...result }));
} catch(error) {
  p.response.error(error);
}`,
      client_script: 'return p.record.submit()',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      active: true,
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
