import modelsLoader from './model.js';
import fieldsLoader from './field.js';
import settingsLoader from './setting.js';
import servicesMetaLoader from './service-meta.js';
import permissionsLoader from './permission.js';
import coreLocksLoader from './core-lock.js';

export default {
  models: modelsLoader,
  fields: fieldsLoader,
  settings: settingsLoader,
  permissions: permissionsLoader,
  core_locks: coreLocksLoader,
  services_meta: servicesMetaLoader,
}
