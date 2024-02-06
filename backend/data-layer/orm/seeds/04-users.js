export default {
  name: 'User',
  plural: 'Users',
  alias: 'user',
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
      options: { length: 50 },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Surname',
      alias: 'surname',
      type: 'string',
      options: { length: 50 },
      __lock: ['delete'],
    },
    {
      name: 'Account',
      alias: 'account',
      type: 'reference',
      readonly_when_script: 'p.record.isPersisted()',
      options: { foreign_model: 'account', foreign_label: 'email' },
      __lock: ['delete'],
    },
    {
      name: 'Home page',
      alias: 'home_page',
      type: 'global_reference',
      options: {
        references: [
          { model: 'dashboard', view: 'default', label: 'name' },
          { model: 'view', view: 'default', label: 'name' },
          { model: 'page', view: 'home_pages', label: 'name' },
        ],
      },
      __lock: ['delete'],
    },
    {
      name: 'User groups',
      alias: 'user_groups',
      type: 'reference_to_list',
      options: { foreign_model: 'user_group', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'Autologout',
      alias: 'autologout',
      type: 'boolean',
      options: { default: false },
      __lock: ['delete'],
    },
    {
      name: 'Email',
      alias: 'email',
      type: 'string',
      required_when_script: '!p.record.isPersisted()',
      options: { format: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$' },
      virtual: true,
      __lock: ['delete'],
    },
    {
      name: 'Password',
      alias: 'password',
      type: 'string',
      required_when_script: '!p.record.isPersisted()',
      virtual: true,
      __lock: ['delete'],
    },
     {
      name: 'Language',
      alias: 'language',
      type: 'reference',
      options: { foreign_model: 'language', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'Devices',
      alias: 'devices',
      type: 'reference_to_list',
      options: { foreign_model: 'mc_device', foreign_label: 'device_name' },
      __lock: ['delete'],
    },
    {
      name: 'Phone',
      alias: 'phone',
      type: 'string',
      options: { length: 20 },
      __lock: ['delete'],
    },
    {
      name: 'Account Type',
      alias: 'account_type',
      type: 'array_string',
      virtual: true,
      options: {
        values: {
          user: 'User',
          service: 'Service',
        },
        default: 'user',
      },
      __lock: ['delete'],
    },
  ],
  records: [
    {
      name: 'System',
      surname: 'Administrator',
      account: { email: process.env.APP_ADMIN_USER, password: process.env.APP_ADMIN_PASS, status: 'active', type: 'user' },
      user_groups: ['__core'],
      email: process.env.APP_ADMIN_USER,
      password: process.env.APP_ADMIN_PASS,
      __lock: ['delete'],
    },
    {
      name: 'Guest',
      account: { email: 'guest@free.man', password: 'password', status: 'active', type: 'user' },
      user_groups: ['__public'],
      email: 'guest@free.man',
      password: 'password',
      __lock: ['delete'],
    },
    {
      name: 'System',
      surname: 'Planned tasks',
      account: { email: 'planned_task@free.man', password: 'password', status: 'active', type: 'service', multisession: 'yes', two_fa:'off' },
      user_groups: ['__core'],
      email: 'planned_task@free.man',
      password: 'password',
      __lock: ['delete'],
    },
    {
      name: 'MC Proxy',
      surname: 'Integration',
      account: { email: 'mc_proxy_integration@free.man', password: 'password', status: 'active', type: 'service', multisession: 'yes', two_fa:'off' },
      user_groups: ['__core'],
      email: 'mc_proxy_integration@free.man',
      password: 'password',
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
        columns: ['id', 'name', 'surname', 'phone', 'account', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'surname', type: 'none' },
          { field: 'phone', type: 'none' },
          { field: 'account', type: 'none' },
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
  actions: [
    {
      name: 'Create',
      alias: 'create',
      type: 'form_button',
      position: '-100',
      on_insert: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();

params.record.account = {
  email: params.record.email,
  password: params.record.password,
  type: params.record.account_type
};

params.getRecord()
  .then((record) => {
    if (record) return record.assignAttributes(params.record) && record.save({ systemActions: params.system_actions });
    return p.getModel(params.modelAlias).then(model => model.insert(params.record, { systemActions: params.system_actions }));
  })
  .then(record => p.actions.goBack())
  .catch(error => p.response.error(error));`,
      condition_script: 'p.currentUser.canCreate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Save',
      alias: 'save',
      type: 'context_menu',
      position: '-100',
      on_insert: true,
      on_update: true,
      client_script: 'p.record.submit()',
      server_script: `const params = p.getRequest();      

try {
  const record = await params.getRecord();

  if (!record.isPersisted()) {
    params.record.account = {
      email: params.record.email,
      password: params.record.password,
      type: params.record.account_type
    };
  }

  record.assignAttributes(params.record);
  await record.save({ systemActions: params.system_actions });

  p.actions.openForm(record.model.alias, record.attributes);
} catch (error) {
  p.response.error(error);
}`,
      condition_script: 'p.record.isPersisted() ? p.currentUser.canUpdate() : p.currentUser.canCreate()',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Change password',
      alias: 'change_password',
      type: 'form_button',
      position: '0',
      on_update: true,
      client_script: `confirm(p.translate('password_change_confirmation', { defaultValue: 'Are you sure you want to change your password?' }))`,
      server_script: `p.actions.openPage('change_password')`,
      condition_script: 'p.record.getValue("id") === (p.currentUser.getValue("id"))',
      active: true,
      __lock: ['delete'],
    }
  ],
  forms: [
    {
      name: 'Default',
      alias: 'default',
      order: 200,
      active: true,
      condition_script: 'p.record.isPersisted() && p.currentUser.canAtLeastWrite()',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'name',
            'phone',
            'user_groups',
            'devices',
            'language',
            '__column__.1_2',
            'surname',
            'account',
            'home_page',
            'autologout',
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
    {
      name: 'User form',
      alias: 'user_form',
      order: 100,
      active: true,
      condition_script: 'p.record.isPersisted() && p.currentUser.canAtLeastRead()',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'name',
            'user_groups',
            'phone',
            'devices',
            'language',
            '__column__.1_2',
            'surname',
            'account',
            'home_page',
            'autologout',
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
        related_components: { list: [] },
      },
      __lock: ['delete'],
    },
    {
      name: 'Create user',
      alias: 'create_user',
      order: 0,
      active: true,
      condition_script: '!p.record.isPersisted() && p.currentUser.canAtLeastWrite()',
      options: {
        components: {
          list: [
            '__tab__.main',
            '__section__.1',
            '__column__.1_1',
            'email',
            'name',
            'phone',
            'user_groups',
            'devices',
            'language',
            '__column__.1_2',
            'password',
            'surname',
            'account_type',
            'home_page',
            'autologout',
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
        related_components: { list: [] },
      },
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
