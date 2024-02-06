const base = {
  versionable_attachments: false,
  fields: [
    { name: 'ID', alias: 'id', type: 'primary_key', __lock: ['delete'] },
    { name: 'Created At', alias: 'created_at', type: 'datetime', readonly_when_script: 'true', __lock: ['delete'] },
    { name: 'Updated At', alias: 'updated_at', type: 'datetime', readonly_when_script: 'true', __lock: ['delete'] },
    { name: 'Created By', alias: 'created_by', type: 'reference', options: { foreign_model: 'user', foreign_label: '{name} {surname}' }, readonly_when_script: 'true', __lock: ['delete'] },
    { name: 'Updated By', alias: 'updated_by', type: 'reference', options: { foreign_model: 'user', foreign_label: '{name} {surname}' }, readonly_when_script: 'true', __lock: ['delete'] },
  ],
  db_rules: [
  ],
  views: [
    {
      name: 'Default',
      alias: 'default',
      type: 'grid',
      condition_script: 'true',
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
        columns: ['id', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
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
  filters: [
    { name: 'Default', query: '', __lock: ['delete'] },
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
          list: [],
          options: {},
        },
        related_components: {
          list: [],
          options: {}
        },
      },
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'query', script: '', __lock: ['delete'] },
    { type: 'model', action: 'create', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'model', action: 'define_layout', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'model', action: 'define_filter', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'attachment', action: 'view', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'attachment', action: 'create', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'attachment', action: 'create_photo', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
    { type: 'attachment', action: 'delete', script: 'p.currentUser.canAtLeastWrite()', __lock: ['delete'] },
  ],
  privileges: [
    { level: 'admin', owner_type: 'user_group', owner_id: '__core', __lock: ['delete'] },
  ],
};

export default {
  base,
};
