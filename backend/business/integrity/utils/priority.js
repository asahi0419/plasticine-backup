const PRIORITY = {
  model: [
    'privilege',
    'db_rule',
    'escalation_rule',
    'ui_rule',
    'filter',
    'appearance',
    'form',
    'action',
    'chart',
    'permission',
    'core_lock',
    'user_setting',
    'json_translation',
    'dynamic_translation',
    'planned_task',
    'global_references_cross',
    'extra_fields_attribute',
    'field',
    'layout',
    'view',
    'model',
  ],
  field: [
    'escalation_rule',
    'rtl',
    'permission',
    'attachment',
    'json_translation',
    'dynamic_translation',
    'layout',
    'filter',
    'appearance',
    'chart',
    'form',
    'extra_fields_attribute',
    'field',
  ],
  user_group: [
    'user',
    'user_group',
  ],
  user: [
    'user_setting',
    'user',
  ],
  action: [
    'page',
    'action',
  ],
  page: [
    'form',
    'page',
  ],
  db_rule: [
    'db_rule',
  ],
  view: [
    'dashboard',
    'form',
    'view',
  ],
  layout: [
    'view',
    'layout',
  ],
  rtl: [
    'rtl',
  ],
  form: [
    'form',
  ],
  user_setting: [
    'user_setting',
  ],
  permission: [
    'permission',
  ],
  privilege: [
    'privilege',
  ],
  core_lock: [
    'core_lock',
  ],
  escalation_rule: [
    'planned_task',
    'escalation_rule',
  ],
  planned_task: [
    'planned_task',
  ],
  global_script: [
    'global_script',
  ],
  filter: [
    'view',
    'filter',
  ],
  web_service: [
    'web_service',
  ],
  appearance: [
    'view',
    'appearance',
  ],
  log: [
    'log',
  ],
  email: [
    'email',
  ],
  setting: [
    'setting',
  ],
  global_references_cross: [
    'global_references_cross',
  ],
  chart: [
    'view',
    'chart',
  ],
  attachment: [
    'attachment',
  ],
  account: [
    'user',
    'account',
  ],
  session: [
    'session',
  ],
  dashboard: [
    'dashboard',
  ],
  ui_rule: [
    'ui_rule',
  ],
  language: [
    'user',
    'language',
  ],
  static_translation: [
    'static_translation',
  ],
  dynamic_translation: [
    'dynamic_translation',
  ],
  json_translation: [
    'json_translation',
  ],
  web_socket: [
    'web_socket',
  ],
  phone: [
    'user',
    'phone',
  ],
  user_sidebar: [
    'user_sidebar',
  ],
  extra_fields_attribute: [
    'extra_fields_attribute',
  ],
};

export const getPriority = (key, model) => {
  const priority = PRIORITY[key];
  return priority ? priority.indexOf(priority.find(alias => alias === model)) : 0;
};
