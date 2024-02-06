import loginPage from './pages/auth/login.js';
import setup2FaPage from './pages/auth/setup-2fa.js';
import logoutPage from './pages/auth/logout.js';
import createAccountPage from './pages/auth/create-account.js';
import passwordRecoveryPage from './pages/auth/password-recovery.js';
import emailConfirmationPage from './pages/auth/email-confirmation.js';
import setupNewPasswordPage from './pages/auth/setup-new-password.js';
import ssoNoAccess from './pages/auth/sso-no-access.js';
import changePassword from './pages/auth/change-password.js';
import leftHeaderElement from './pages/layout/header/left.js';
import middleHeaderElement from './pages/layout/header/middle.js';
import rightHeaderElement from './pages/layout/header/right.js';
import headerContainerElement from './pages/layout/header/container.js';
import sidebarContainerElement from './pages/layout/containers/sidebar.js';
import contentContainerElement from './pages/layout/containers/content.js';
import layoutElement from './pages/layout/index.js';
import notFoundPage from './pages/not-found.js';
import privilegeManagerPage from './pages/privilege-manager.js';
import startPage from './pages/start.js';
import tutorial from './pages/tutorial.js';
import dialogSelectTheModel from './pages/dialog-select-the-model.js';

export default {
  name: 'Page',
  plural: 'Pages',
  alias: 'page',
  type: 'core',
  template: 'base',
  access_script: 'true ',
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
      name: 'Access script',
      alias: 'access_script',
      type: 'condition',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Template',
      alias: 'template',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      required_when_script: 'true',
      __lock: ['delete'],
    },
    {
      name: 'Styles',
      alias: 'styles',
      type: 'string',
      options: { length: 150000, syntax_hl: 'css' },
      __lock: ['delete'],
    },
    {
      name: 'Component script',
      alias: 'component_script',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Server script',
      alias: 'server_script',
      type: 'string',
      options: { length: 150000, syntax_hl: 'js' },
      __lock: ['delete'],
    },
    {
      name: 'Actions',
      alias: 'actions',
      type: 'reference_to_list',
      options: { foreign_model: 'action', foreign_label: 'name' },
      __lock: ['delete'],
    },
    {
      name: 'Home page',
      alias: 'home_page',
      type: 'boolean',
      options: { default: false },
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
  records: [
    loginPage,
    setup2FaPage,
    logoutPage,
    createAccountPage,
    passwordRecoveryPage,
    emailConfirmationPage,
    setupNewPasswordPage,
    changePassword,
    ssoNoAccess,
    notFoundPage,
    privilegeManagerPage,
    leftHeaderElement,
    middleHeaderElement,
    rightHeaderElement,
    headerContainerElement,
    sidebarContainerElement,
    contentContainerElement,
    layoutElement,
    startPage,
    tutorial,
    dialogSelectTheModel,
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
      name: 'Home pages',
      alias: 'home_pages',
      type: 'grid',
      condition_script: 'p.currentUser.isAdmin()',
      layout: 'Default',
      filter: 'Home pages',
      __lock: ['delete'],
    },
  ],
  layouts: [
    {
      name: 'Default',
      type: 'grid',
      options: {
        columns: ['id', 'name', 'alias', 'created_at', 'updated_at', 'created_by', 'updated_by'],
        columns_options: {},
        sort_order: [
          { field: 'id', type: 'descending' },
          { field: 'name', type: 'none' },
          { field: 'alias', type: 'none' },
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
            'name',
            '__column__.1_2',
            'alias',
            '__section__.2',
            'server_script',
            'component_script',
            'template',
            'styles',
            'access_script',
            'actions',
            'home_page',
            '__attachments__',
            '__tab__.service',
            '__section__.3',
            '__column__.3_1',
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
            '__attachments__': { name: 'Assets' },
            '__tab__.service': { name: 'Service' },
          },
        },
        related_components: { list: [], options: {} },
      },
      __lock: ['delete'],
    },
  ],
  filters: [
    {
      name: 'Home pages',
      query: '`home_page` = true',
      __lock: ['delete'],
    },
  ],
  permissions: [
    { type: 'model', action: 'create', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'update', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
    { type: 'model', action: 'delete', script: 'p.currentUser.isAdmin()', __lock: ['delete'] },
  ],
};
