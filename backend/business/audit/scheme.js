export default {
  order: -1000,
  type: 'audit',
  access_script: 'p.currentUser.canAtLeastRead()',
  audit: 'none',
  template: 'base',
  __lock: ['delete'],
  fields: [
    {
      name: 'Related record',
      alias: 'related_record',
      type: 'integer',
    },
    {
      name: 'Related field',
      alias: 'related_field',
      type: 'reference',
      options: { foreign_model: 'field', foreign_label: 'name' },
    },
    {
      name: 'From',
      alias: 'from',
      type: 'string',
      options: { length: 200000 },
    },
    {
      name: 'To',
      alias: 'to',
      type: 'string',
      options: { length: 200000 },
    },
    {
      name: 'Action',
      alias: 'action',
      type: 'array_string',
      options: {
        values: {
          created: 'Created',
          updated: 'Updated',
          deleted: 'Deleted',
        },
      },
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
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'action', 'related_record', 'related_field', 'created_at', 'created_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'action', type: 'none' },
          { field: 'related_record', type: 'none' },
          { field: 'related_field', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
        ],
        wrap_text: true,
        no_wrap_text_limit: 50,
      },
      __lock: ['delete'],
    },
  ],
};
