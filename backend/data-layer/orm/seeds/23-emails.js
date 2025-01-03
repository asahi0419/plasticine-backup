export default {
  name: 'Email',
  plural: 'Emails',
  alias: 'email',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  menu_visibility: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Target record',
      alias: 'target_record',
      type: 'global_reference',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: { values: { out: 'Outgoing', in: 'Incoming' } },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          new: 'New',
          enqueued: 'Enqueued',
          processed: 'Processed',
          error: 'Error',
        },
        default: 'new',
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'From',
      alias: 'from',
      type: 'string',
      options: {
        length: 1000,
        rows: 1,
      },
      __lock: ['delete'],
    },
    {
      name: 'To',
      alias: 'to',
      type: 'string',
      options: {
        length: 4000,
        rows: 1,
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'CC',
      alias: 'cc',
      type: 'string',
      options: {
        length: 4000,
        rows: 1,
      },
      __lock: ['delete'],
    },
    {
      name: 'Subject',
      alias: 'subject',
      type: 'string',
      options: {
        length: 4000,
        rows: 1,
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Body',
      alias: 'body',
      type: 'string',
      options: { length: 100000 },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Content type',
      alias: 'content_type',
      type: 'array_string',
      options: { values: { text: 'Text', html: 'HTML' }, default: 'text' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Enqueued at',
      alias: 'enqueued_at',
      type: 'datetime',
      __lock: ['delete'],
    },
    {
      name: 'Sent at',
      alias: 'sent_at',
      type: 'datetime',
      __lock: ['delete'],
    },
    {
      name: 'Worker ts',
      alias: 'worker_ts',
      type: 'datetime',
      __lock: ['delete'],
    },
    {
      name: 'Processing attempts',
      alias: 'processing_attempts',
      type: 'integer',
      options: { default: 0 },
      __lock: ['delete'],
    },
  ],
  views: [
    {
      name: 'Incoming',
      alias: 'incoming',
      type: 'grid',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      layout: 'Incoming',
      filter: 'Incoming',
      __lock: ['delete'],
    },
    {
      name: 'Outgoing',
      alias: 'outgoing',
      type: 'grid',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      layout: 'Outgoing',
      filter: 'Outgoing',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Incoming',
      type: 'grid',
      options: {
        columns: ['id', 'from', 'subject', 'content_type', 'created_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'from', type: 'none' },
          { field: 'subject', type: 'none' },
          { field: 'content_type', type: 'none' },
          { field: 'created_at', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
    {
      name: 'Outgoing',
      type: 'grid',
      options: {
        columns: ['id', 'to', 'subject', 'content_type', 'status', 'sent_at'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'to', type: 'none' },
          { field: 'subject', type: 'none' },
          { field: 'content_type', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'sent_at', type: 'none' },
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
            'status',
            'to',
            'from',
            '__column__.1_2',
            'sent_at',
            'cc',
            'subject',
            '__section__.2',
            'body',
            '__section__.3',
            '__column__.3_1',
            'target_record',
            'type',
            'worker_ts',
            '__column__.3_2',
            'content_type',
            'enqueued_at',
            'processing_attempts',
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
            '__attachments__',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.service': { name: 'Service' },
            '__attachments__': { name: 'Attachments' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: ['delete'],
    },
  ],
  filters: [
    {
      name: 'Incoming',
      query: "`type` = 'in'",
      __lock: ['delete'],
    },
    {
      name: 'Outgoing',
      query: "`type` = 'out'",
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
