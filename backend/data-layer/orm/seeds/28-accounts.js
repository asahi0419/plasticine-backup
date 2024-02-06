export default {
  name: 'Account',
  plural: 'Accounts',
  alias: 'account',
  type: 'core',
  template: 'base',
  access_script: 'p.currentUser.canAtLeastRead()',
  order: '-100',
  __lock: ['delete'],
  fields: [
    {
      name: 'Email',
      alias: 'email',
      type: 'string',
      index: 'unique',
      required_when_script: 'true',
      options: { format: '^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$' },
      __lock: ['delete'],
    },
    {
      name: 'Password',
      alias: 'password',
      type: 'string',
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Salt',
      alias: 'salt',
      type: 'string',
      hidden_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Status',
      alias: 'status',
      type: 'array_string',
      options: {
        values: {
          active: 'Active',
          banned: 'Banned',
          expired: 'Expired',
          disabled: 'Disabled',
          inactive: 'Inactive',
          waiting_confirmation: 'Waiting confirmation',
        },
        default: 'active',
      },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Multisession',
      alias: 'multisession',
      type: 'array_string',
      options: {
        values: {
          global: 'By global setting',
          no: 'No',
          yes: 'Yes',
        },
        default: 'global',
      },
      readonly_when_script: `p.record.getValue('type') ==='service'`,
      __lock: ['delete'],
    },
    {
      name: 'Security code',
      alias: 'security_code',
      type: 'string',
      options: {
        length: 100,
      },
      __lock: ['delete'],
    },
    {
      name: 'Deactivation reason',
      alias: 'deactivation_reason',
      type: 'string',
      options: {
        length: 500,
      },
      __lock: ['delete'],
    },
    {
      name: 'Static token',
      alias: 'static_token',
      type: 'string',
      index: 'unique',
      options: {
        length: 32,
      },
      __lock: ['delete'],
    },
    {
      name: 'Last password change',
      alias: 'last_password_change',
      type: 'datetime',
      options: {},
      readonly_when_script: 'true',
      __lock: ['delete']
    },
    {
      name: '2FA',
      alias: 'two_fa',
      type: 'array_string',
      options: {
        values: {
          'global': 'By global setting',
          'off': 'Off',
          'app': 'App',
        },
        default: 'global',
      },
      hint: 'static.account_2fa_hint',
      readonly_when_script: `p.record.getValue('type') ==='service'`,
      __lock: ['delete'],
    },
    {
      name: '2FA Activated',
      alias: 'two_fa_activated',
      type: 'boolean',
      options: {
        default: false,
      },
      hint: 'static.account_2fa_activated_hint',
      readonly_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: '2FA Code',
      alias: 'two_fa_code',
      type: 'string',
      options: {
        length: 32,
      },
      hint: 'static.account_2fa_code_hint',
      readonly_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Type',
      alias: 'type',
      type: 'array_string',
      options: {
        values: {
          user: 'User',
          service: 'Service',
        },
        default: 'user',
      },
      readonly_when_script: 'p.record.isPersisted()',
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
        columns: ['id', 'email', 'status', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'email', type: 'none' },
          { field: 'status', type: 'none' },
          { field: 'type', type: 'none' },
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
  db_rules: [
    {
      name: 'Process last password change',
      order: '-100',
      active: true,
      when_perform: 'before',
      on_insert: true,
      on_update: true,
      on_delete: false,
      condition_script: 'true',
      script: `if (p.action === 'create') {
  p.record.setValue('last_password_change', new Date());
}

if (p.record.isChanged('password')) {
  p.record.setValue('last_password_change', new Date());

  if (p.record.getValue('status') === 'expired') {
    p.record.setValue('status', 'active');
  }
}

if (p.action === 'create' && p.getSetting('security.new_account_expired') && (p.record.getValue('status') === 'active')) {
    p.record.setValue('status', 'expired');
}`,
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
            'email',
            'status',
            'two_fa',
            'two_fa_code',
            'two_fa_activated',
            '__column__.1_2',
            'password',
            'static_token',
            'multisession',
            'last_password_change',
            'type',
            '__tab__.activation',
            '__section__.2',
            'security_code',
            'deactivation_reason',
            '__tab__.service',
            '__section__.2',
            'id',
            '__section__.3',
            '__column__.3_1',
            'created_at',
            'updated_at',
            '__column__.3_2',
            'created_by',
            'updated_by',
          ],
          options: {
            '__tab__.main': { expanded: true, name: 'Main' },
            '__tab__.activation': { name: 'Activation' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {}},
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
