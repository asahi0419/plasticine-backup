import { measureTime } from '../../../../business/helpers/index.js';

import init from './init/index.js';
import loadModels from './load/models/index.js';
import loadView from './load/view/index.js';
import loadWorklog from './load/worklog/index.js';
import loadChartScope from './load/chart-scope.js';
import loadDashboards from './load/dashboards.js';
import loadFAIcons from './load/fa-icons.js';
import loadFieldOptions from './load/field-options.js';
import loadFields from './load/fields.js';
import loadForm from './load/form.js';
import loadPages from './load/pages.js';
import loadReferencedFields from './load/referenced-fields.js';
import loadTemplateFields from './load/template-fields.js';
import loadTemplate from './load/template.js';
import loadTemplates from './load/templates.js';
import loadToken from './load/token.js';
import loadTranslation from './load/translation.js';
import loadUser from './load/user.js';
import loadViews from './load/views.js';
import loadReferences from './load/references.js';
import authUser from './auth-user.js';
import checkAuth from './check-auth.js';
import login from './login.js';
import logout from './logout.js';
import processFilter from './process-filter.js';
import updateUserSettings from './update-user-settings.js';

export default {
  init: (req, res) => measureTime('REST API: Commands - init', init, [req, res]),
  checkAuth: (req, res) => measureTime('REST API: Commands - checkAuth', checkAuth, [req, res]),
  authUser: (req, res) => measureTime('REST API: Commands - authUser', authUser, [req, res]),
  login: (req, res) => measureTime('REST API: Commands - login', login, [req, res]),
  logout: (req, res) => measureTime('REST API: Commands - logout', logout, [req, res]),
  updateUserSettings: (req, res) => measureTime('REST API: Commands - updateUserSettings', updateUserSettings, [req, res]),
  processFilter: (req, res) => measureTime('REST API: Commands - processFilter', processFilter, [req, res]),
  loadUser: (req, res) => measureTime('REST API: Commands - loadUser', loadUser, [req, res]),
  loadModels: (req, res) => measureTime('REST API: Commands - loadModels', loadModels, [req, res]),
  loadPages: (req, res) => measureTime('REST API: Commands - loadPages', loadPages, [req, res]),
  loadDashboards: (req, res) => measureTime('REST API: Commands - loadDashboards', loadDashboards, [req, res]),
  loadView: (req, res) => measureTime('REST API: Commands - loadView', loadView, [req, res]),
  loadForm: (req, res) => measureTime('REST API: Commands - loadForm', loadForm, [req, res]),
  loadChartScope: (req, res) => measureTime('REST API: Commands - loadChartScope', loadChartScope, [req, res]),
  loadFieldOptions: (req, res) => measureTime('REST API: Commands - loadFieldOptions', loadFieldOptions, [req, res]),
  loadFields: (req, res) => measureTime('REST API: Commands - loadFields', loadFields, [req, res]),
  loadTranslation: (req, res) => measureTime('REST API: Commands - loadTranslation', loadTranslation, [req, res]),
  loadReferencedFields: (req, res) => measureTime('REST API: Commands - loadReferencedFields', loadReferencedFields, [req, res]),
  loadTemplateFields: (req, res) => measureTime('REST API: Commands - loadTemplateFields', loadTemplateFields, [req, res]),
  loadWorklog: (req, res) => measureTime('REST API: Commands - loadWorklog', loadWorklog, [req, res]),
  loadFAIcons: (req, res) => measureTime('REST API: Commands - loadFAIcons', loadFAIcons, [req, res]),
  loadTemplate: (req, res) => measureTime('REST API: Commands - loadTemplate', loadTemplate, [req, res]),
  loadTemplates: (req, res) => measureTime('REST API: Commands - loadTemplates', loadTemplates, [req, res]),
  loadViews: (req, res) => measureTime('REST API: Commands - loadViews', loadViews, [req, res]),
  loadToken: (req, res) => measureTime('REST API: Commands - loadToken', loadToken, [req, res]),
  loadReferences: (req, res) => measureTime('REST API: Commands - loadReferences', loadReferences, [req, res]),
};
