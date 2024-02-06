export default {
  name: 'Attachment',
  plural: 'Attachments',
  alias: 'attachment',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Target record',
      alias: 'target_record',
      type: 'global_reference',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Field',
      alias: 'field',
      type: 'reference',
      options: { foreign_model: 'field', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'File name',
      alias: 'file_name',
      type: 'string',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Version',
      alias: 'version',
      type: 'integer',
      options: { default: 1 },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Last version',
      alias: 'last_version',
      type: 'boolean',
      options: { default: true },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'File content type',
      alias: 'file_content_type',
      type: 'string',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Thumbnail',
      alias: 'thumbnail',
      type: 'boolean',
      options: { default: false },
      __lock: ['delete'],
    },
    {
      name: 'File size',
      alias: 'file_size',
      type: 'integer',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Latitude',
      alias: 'p_lat',
      type: 'float',
      __lock: ['delete'],
    },
    {
      name: 'Longitude',
      alias: 'p_lon',
      type: 'float',
      __lock: ['delete'],
    },
    {
      name: 'Linked from',
      alias: 'linked_from',
      type: 'reference',
      options: { foreign_model: 'attachment', foreign_label: 'file_name' },
      __lock: ['delete'],
    },
    {
      name: 'Content ID',
      alias: 'cid',
      type: 'string',
      __lock: ['delete'],
    }
  ],
  actions: [
    {
      name: 'New',
      alias: 'new',
      type: 'view_button',
      position: '-100',
      server_script: `const params = p.getRequest();

try {
  const model = await p.getModel(params.modelAlias);
  const record = await model.build(await params.getAttributesFromFilter());
  p.actions.openForm(params.modelAlias, record.attributes);
} catch (error) {
  p.response.error(error)
}`,
      condition_script: "(p.this.getType() === 'view') && p.currentUser.canCreate()",
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Attach files',
      alias: 'attach_files',
      type: 'view_button',
      position: '-100',
      client_script: `p.actions.openFileDialog();
return false;`,
      condition_script: `(p.this.getType() === 'form') && (p.this.attributes.alias !== 'previous_versions') && p.currentUser.canAttach(p.record.model.id)`,
      options: { icon: 'attach', icon_position: 'right' },
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Set thumbnail',
      alias: 'set_thumbnail',
      type: 'view_choice',
      position: '-100',
      on_update: true,
      server_script: `const { ids, embedded_to } = p.getRequest();

try {
  const attachmentModel = await p.getModel('attachment');
  const grcModel = await p.getModel('global_references_cross');
  const model = await p.getModel(embedded_to.model);

  const grcRecords = await grcModel.find({ target_model: model.id, target_record_id: embedded_to.record_id });
  const grcSourceRecordsIds = grcRecords.map(({ attributes }) => attributes.source_record_id);
  const attachmentRecords = await attachmentModel.find({ id: grcSourceRecordsIds });
  const record = attachmentRecords.find((record) => record.attributes.id === ids.sort()[0]);

  await record.assignAttributes({ thumbnail: true }) && record.save();
  await attachmentRecords.map(r => (record.id !== r.id) && (r.assignAttributes({ thumbnail: false }) && r.save()));

  p.actions.openView('__self');
} catch (error) {
  p.response(error);
}`,
      condition_script: `(p.this.getType() === 'form') && (p.this.attributes.alias === 'last_versions') && p.currentUser.canUpdate(p.record.model.id)`,
      active: true,
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
    {
      name: 'Last versions',
      alias: 'last_versions',
      type: 'grid',
      condition_script: "p.currentUser.isAdmin() || p.getRequest().exec_by.type === 'attachment_view'",
      layout: 'Default',
      filter: 'Last versions',
      __lock: ['delete'],
    },
    {
      name: 'Previous versions',
      alias: 'previous_versions',
      type: 'grid',
      condition_script: "p.currentUser.isAdmin() || p.getRequest().exec_by.type === 'attachment_view'",
      layout: 'Default',
      filter: 'Previous versions',
      __lock: ['delete'],
    },
  ],
  filters: [
    {
      name: 'Last versions',
      query: '`last_version` = true',
      __lock: ['delete'],
    },
    {
      name: 'Previous versions',
      query: '`last_version` = false',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'file_name', 'version', 'thumbnail', 'file_size', 'created_at', 'created_by', 'file_content_type', 'cid', 'p_lat', 'p_lon'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'none' },
          { field: 'file_name', type: 'ascending' },
          { field: 'version', type: 'none' },
          { field: 'file_content_type', type: 'none' },
          { field: 'file_size', type: 'none' },
          { field: 'p_lat', type: 'none' },
          { field: 'p_lon', type: 'none' },
          { field: 'cid', type: 'none' },
          { field: 'thumbnail', type: 'none' },
          { field: 'created_at', type: 'none' },
          { field: 'created_by', type: 'none' },
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
            'file_name',
            'version',
            'target_record',
            'file_content_type',
            'file_size',
            '__column__.1_2',
            'last_version',
            'field',
            'thumbnail',
            'linked_from',
            'cid',
            '__tab__.service',
            '__section__.2',
            'id',
            '__section__.3',
            '__column__.3_1',
            'created_at',
            'updated_at',
            'p_lat',
            '__column__.3_2',
            'created_by',
            'updated_by',
            'p_lon',
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
    {
      type: 'model',
      action: 'create',
      script: 'p.currentUser.isAdmin()',
      __lock: ['delete'],
    },
    {
      type: 'model',
      action: 'update',
      script: 'p.currentUser.isAdmin()',
      __lock: ['delete'],
    },
    {
      type: 'model',
      action: 'delete',
      script: 'p.currentUser.isAdmin()',
      __lock: ['delete'],
    },
    {
      type: 'field',
      action: 'update',
      script: 'false',
      field: { alias: 'file_name' },
      __lock: ['delete', 'update']
    },
  ],
};
