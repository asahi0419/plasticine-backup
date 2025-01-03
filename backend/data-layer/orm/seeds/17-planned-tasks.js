export default {
  name: 'Planned task',
  plural: 'Planned tasks',
  alias: 'planned_task',
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
      hidden_when_script: `!p.record.getValue('model');`,
      __lock: ['delete'],
    },
    {
      name: 'Record',
      alias: 'record',
      type: 'integer',
      hidden_when_script: `!p.record.getValue('record');`,
      __lock: ['delete'],
    },
    {
      name: 'Escalation rule',
      alias: 'escalation_rule',
      type: 'reference',
      options: {
        foreign_model: 'escalation_rule',
        foreign_label: 'name',
        depends_on: ['model'],
        default: null,
      },
      hidden_when_script: `!p.record.getValue('escalation_rule');`,
      __lock: ['delete'],
    },
    {
      name: 'Scheduled task',
      alias: 'scheduled_task',
      type: 'reference',
      options: {
        foreign_model: 'scheduled_task',
        foreign_label: 'name',
        depends_on: ['model'],
        default: null,
      },
      hidden_when_script: `!p.record.getValue('scheduled_task');`,
    },
    {
      name: 'Scheduled on',
      alias: 'scheduled_on',
      type: 'datetime',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    { name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          new: 'New',
          enqueued: 'Enqueued',
          in_progress: 'In progress',
          completed: 'Completed',
          error: 'Error',
          timeout_error: 'Timeout error',
          cancelled: 'Cancelled',
        },
        default: 'new',
        length: 2048,
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Timeout counter',
      alias: 'timeout_counter',
      type: 'integer',
      options: { default: 0 },
      __lock: ['delete'],
    },
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'false',
      layout: 'Default',
      filter: 'Default',
      __lock: ['delete'],
    },
    {
      name: 'Rules',
      alias: 'rules',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Rules',
      filter: 'Rules',
      __lock: ['delete'],
    },
    {
      name: 'Tasks',
      alias: 'tasks',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Tasks',
      filter: 'Tasks',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'created_at', 'created_by', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'updated_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
    {
      name: 'Rules',
      type: 'grid',
      options: {
        columns: ['id', 'escalation_rule', 'scheduled_on', 'status', 'created_at', 'created_by', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'escalation_rule', type: 'none' },
          { field: 'scheduled_on', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
          { field: 'updated_at', type: 'none' },
          { field: 'updated_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
    {
      name: 'Tasks',
      type: 'grid',
      options: {
        columns: ['id', 'scheduled_task', 'scheduled_on', 'status', 'created_at', 'created_by', 'updated_at', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'scheduled_task', type: 'none' },
          { field: 'scheduled_on', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
          { field: 'updated_at', type: 'none' },
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
            'scheduled_on',
            'escalation_rule',
            'scheduled_task',
            '__column__.1_2',
            'status',
            'record',
            '__section__.2',
            'model',
            'timeout_counter',
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
    { type: 'model', action: 'create', script: 'true', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'true', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'true', __lock: ['delete'] },
  ],
  filters: [
    {
      name: 'Default',
      query: "",
    },
    {
      name: 'Rules',
      query: "`escalation_rule` IS NOT NULL",
    },
    {
      name: 'Tasks',
      query: "`scheduled_task` IS NOT NULL",
    },
  ]
};
