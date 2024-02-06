export default {
    name: 'Attachments Library',
    plural: 'Attachments Libraries',
    alias: 'attachments_library',
    type: 'core',
    template: 'base',
    access_script: 'p.currentUser.canAtLeastRead()',
    menu_visibility: 'true',
    order: '-100',
    __lock: ['delete'],
    fields: [
      {
        name: 'Name',
        alias: 'name',
        type: 'string',
        required_when_script: 'true',
        __lock: ['delete'],
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
        name: 'Attachment',
        alias: 'attachment',
        type: 'file',
        required_when_script: 'true',
        __lock: ['delete'],
      },
      {
        name: 'Description',
        alias: 'description',
        type: 'string',
        options: { rows: 2 },
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
        name: 'Default',
        alias: 'default',
        type: 'grid',
        condition_script: 'p.currentUser.canAtLeastWrite()',
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
          columns: [
            'id',
            'name',
            'alias',
            'description',
            'created_at',
            'updated_at',
          ],
          columns_options: {},
          sort_order: [
            { field: 'id', type: 'descending' },
            { field: 'name', type: 'none' },
            { field: 'alias', type: 'none' },
            { field: 'description', type: 'none' },
            { field: 'created_at', type: 'none' },
            { field: 'updated_at', type: 'none' },
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
        condition_script: 'true',
        options: {
          components: {
            list: [
              '__tab__.main',
              '__section__.1',
              '__column__.1_1',
              'name',
              'attachment',
              'description',
              '__column__.1_2',
              'alias',
              '__tab__.service',
              '__section__.2',
              '__column__.2_1',
              'id',
              'created_at',
              'updated_at',
              '__column__.2_2',
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
      {
        type: 'model',
        action: 'create',
        script: 'p.currentUser.canAtLeastWrite()',
        __lock: ['delete'],
      },
      {
        type: 'model',
        action: 'update',
        script: 'p.currentUser.canAtLeastWrite()',
        __lock: ['delete'],
      },
      {
        type: 'model',
        action: 'delete',
        script: 'p.currentUser.canAtLeastWrite()',
        __lock: ['delete'],
      },
    ],
  };
  