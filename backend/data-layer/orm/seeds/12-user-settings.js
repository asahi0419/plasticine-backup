const TYPE_OPTIONS_BY_MODEL = {
  view: {
    values: {
      main_view: 'Main',
      related_view: 'Related',
      embedded_view: 'Embedded',
      attachment_view: 'Attachment',
      reference_view: 'Reference',
      global_reference_view: 'Global reference',
      rtl: 'Reference to list',
      rtl_popup: 'Reference to list (popup)',
    },
    default: 'main_view',
  },
  layout: {
    values: {
      main_view: 'Main',
      related_view: 'Related',
      embedded_view: 'Embedded',
      attachment_view: 'Attachment',
      reference_view: 'Reference',
      global_reference_view: 'Global reference',
      rtl: 'Reference to list',
      rtl_popup: 'Reference to list (popup)',
    },
    default: 'main_view',
  },
  page: {
    values: {
      layout: 'Layout',
      sidebar_container: 'Sidebar container',
    },
    default: 'layout',
  },
  dashboard: {
    values: {
      main: 'Main',
    },
    default: 'main',
  },
};

const TYPE_OPTIONS_DEFAULT = {
  values: {
    main: 'Main',
  },
  default: 'main',
};

export default {
  name: 'User setting',
  plural: 'User settings',
  alias: 'user_setting',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'User',
      alias: 'user',
      type: 'reference',
      options: { foreign_model: 'user', foreign_label: '{name} {surname}' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Model',
      alias: 'model',
      type: 'reference',
      options: { foreign_model: 'model', foreign_label: 'name' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Reference ID',
      alias: 'record_id',
      type: 'integer',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          ...TYPE_OPTIONS_BY_MODEL.view.values,
          ...TYPE_OPTIONS_BY_MODEL.layout.values,
          ...TYPE_OPTIONS_BY_MODEL.page.values,
          ...TYPE_OPTIONS_BY_MODEL.dashboard.values,
        },
        default: 'main',
      },
      __lock: ['delete'],
    },
    {
      name: 'Options',
      alias: 'options',
      type: 'string',
      options: { length: 10000, syntax_hl: 'json' },
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
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'user', 'model', 'record_id', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'user', type: 'none' },
          { field: 'model', type: 'none' },
          { field: 'record_id', type: 'none' },
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
      order: 0,
      active: true,
      condition_script: 'true',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'user',
            '__column__.1_2',
            'record_id',
            '__section__.2',
            'options',
            'type',
            'model',
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
    { type: 'model', action: 'create', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.canAtLeastRead()', __lock: ['delete'] },
  ],
  ui_rules: [
    {
      name: 'Type: Initialize',
      order: '0',
      active: true,
      type: 'on_load',
      script: `const TYPE_OPTIONS_BY_MODEL = ${JSON.stringify(TYPE_OPTIONS_BY_MODEL, null, 2)};
const TYPE_OPTIONS_DEFAULT = ${JSON.stringify(TYPE_OPTIONS_DEFAULT, null, 2)};

const modelField = p.record.getField('model');
const typeField = p.record.getField('type');

const setOptions = (modelId) => {
  const model = utils.getModel(modelId);
  const options = TYPE_OPTIONS_BY_MODEL[model.alias] || TYPE_OPTIONS_DEFAULT;

  typeField.setOptions(options);
}

setOptions(p.record.getValue('model'));
modelField.onChange((oldValue, newValue) => setOptions(newValue));`,
      __lock: ['delete'],
    },
  ],
};
