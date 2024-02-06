import { isEmpty, assign, pick, each, find, map, filter, reduce, orderBy, uniqBy } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import logger from '../../../../../business/logger/index.js';
import components from '../../../../../business/components/index.js';
import * as SECURITY from '../../../../../business/security/index.js';
import { loadPages } from '../load/pages.js';
import { getSetting } from '../../../../../business/setting/index.js';
import { parseOptions } from '../../../../../business/helpers/index.js';
import { loadPageUserSettings, createFilterByScript } from '../load/helpers.js';

import * as CONSTANTS from './constants.js';
import SETTINGS from '../../../../../data-layer/orm/index.js';

export function getTranslations(data, langAlias) {
  try {
    return data[langAlias].translation.static;
  } catch (error) {
    return {};
  }
}

export async function getPages(sandbox, authenticated) {
  if (!authenticated) return null;
  const filter = '`alias` IN (' + CONSTANTS.PAGES_LIST.join() + ')';
  return loadPages(sandbox, filter);
}

export function getComponents(authenticated) {
  if (!authenticated) return null;
  return components();
}

export async function getSettings(sandbox, authenticated, errors = []) {
  const themes = getSetting('themes');
  const format = getSetting('format');
  const defaultTheme = find(themes, 'default');
  let authorization = reduce(getSetting('authorization'), (r, s, k) => {
    const keysPick = ['social_network', 'service_account_button'];
    return { ...r, [k]: keysPick.includes(k) ? pick(s, ['enabled', 'name', 'icon']) : s };
  }, {});

  authorization.sso.strategies = reduce(authorization.sso.strategies, (r, s, k) => {
    const keysPick = ['azure', 'google', 'custom', 'custom_saml2'];
    return { ...r, [k]: keysPick.includes(k) ? pick(s, ['enabled', 'name', 'icon']) : s };
  }, {});

  const result = {
    project_name: getSetting('project_name'),
    theme: defaultTheme.alias,
    themes: [ defaultTheme ],
    start_url: getStartUrl(getSetting('start_url')),
    timeout: pick(getSetting('timeout'), ['action']),
    authorization,
    format,
  };

  if (authenticated) {
    const { theme, layout_mode } = await loadUserAppLayout(sandbox.user);

    assign(result, {
      home_page: await loadHomePage(sandbox),
      theme,
      themes,
      layout_mode,
      extensions: { plugins: await loadPlugins() },
      services: await loadServices(),
      db_provider: db.client.provider,
      limits: getSetting('limits'),
      hidden_paginator_query_limit: getSetting('hidden_paginator_query_limit'),
      attachments_settings: getSetting('attachments_settings'),
      decoration: getSetting('decoration'),
      tutorial: getSetting('tutorial'),
      env: {
        name: sandbox.vm.utils.getEnvName(),
      },
      host: {
        name: sandbox.vm.utils.getHostName(),
        protocol: sandbox.vm.utils.getHostProtocol(),
        url: sandbox.vm.utils.getHostURL(),
      },
    });
  }

  validateSettings(['themes', 'limits'], result, sandbox, errors)

  return result;
}

export function validateSettings(list, settings, sandbox, errors = []) {
  each(filter(list, (alias) => settings[alias]), (alias) => {
    let value = parseOptions(settings[alias]);

    if (isEmpty(value)) {
      const setting = find(SETTINGS, { alias });
      value = parseOptions(setting.value);
      errors.push(sandbox.translate('static.parse_settings_error', { name: setting.name }));
    }

    settings[alias] = value;
  });
}

export function getStartUrl(startUrl) {
  return startUrl || CONSTANTS.DEFAULT_START_URL;
}

export async function loadPlugins() {
  const { plugins = [] } = getSetting('extensions') || {};
  const active = filter(plugins, 'active');
  const aliases = map(active, 'alias');
  return db.model('plugin').pluck('name').whereIn('alias', aliases);
}

export async function loadServices() {
  const services = ['MC_PROXY', 'LIBREOFFICE'];

  return reduce(services, (result, alias) => {
    if (JSON.parse(process.env[`SERVICE_${alias}_INSTALL`] || 'false')) {
      result.push({
        branch: process.env[`SERVICE_${alias}_BRANCH`],
        build: process.env[`SERVICE_${alias}_BUILD`],
        name: process.env[`SERVICE_${alias}_NAME`] || 'alias',
        date: process.env[`SERVICE_${alias}_DATE`],
      });
    }

    return result;
  }, []);
}

export async function loadUserAppLayout(user) {
  const themes = getSetting('themes') || [];

  const { theme: themeAlias, layout_mode } = await loadPageUserSettings(user, 'layout') || {};
  const { alias: themeAliasDefault } = find(themes, 'default') || {};

  const result = { theme: themeAlias || themeAliasDefault };
  if (layout_mode) result.layout_mode = layout_mode;

  return result;
}

export async function loadHomePage(sandbox) {
  const result = await loadHomePageByUser(sandbox)
    || await loadHomePageBySetting(sandbox)
    || await loadHomePageByDashboards(sandbox)
    || await loadHomePageByFirstView(sandbox)
    || 'pages/start';

  return result;
}

export async function loadHomePageByUser(sandbox) {
  const { model, id } = sandbox.user.home_page || {};

  if (!model) return
  if (!id) return

  try {
    const targetModel = db.getModel(model);
    if (!targetModel) return;

    const targetRecord = await db.model(targetModel.alias).where({ id }).getOne();
    if (!targetRecord) return;

    if (targetRecord.model) {
      const access = await SECURITY.checkAccess('model', db.getModel(targetRecord.model), sandbox);
      if (!access) return;
    }

    const access = await SECURITY.checkAccess(targetModel, targetRecord, sandbox);
    if (!access) return;

    return processHomePageByUser(targetModel, targetRecord);
  } catch (error) {
    logger.error(error)
  }
}

export async function processHomePageByUser(targetModel, targetRecord) {
  switch (targetModel.alias) {
    case 'page':
      return `/pages/${targetRecord.alias}`;
    case 'dashboard':
      return `/dashboard/${targetRecord.alias}`;
    case 'view':
      const targetRecordModel = db.getModel(targetRecord.model);
      return `/${targetRecordModel.alias}/view/${targetRecord.type}/${targetRecord.alias}`;
    default:
      return;
  }
}

export async function loadHomePageBySetting(sandbox) {
  let value = getSetting('home_page');

  if (!value) return;

  const [ arg0 = '', arg1 = '', arg2 = '', arg3 = '' ] = value.split('/');

  if (['pages', 'dashboards'].includes(arg0)) {
    if (!(await SECURITY.checkAccess(arg0.slice(0, -1), { alias: arg1 }, sandbox))) return;
  } else if (arg1 === 'view') {
    if (!(await SECURITY.checkAccess(arg1, { alias: arg3 }, sandbox))) return;
  } else if (arg1 === 'form') {
    if (!(await SECURITY.checkAccess(arg1, { id: arg2 }, sandbox))) return;
  } else {
    logger.error(sandbox.translate('static.cannot_redirect_to_home_page_invalid_url'));
    return;
  }
  if (value[0] !== '/') value = `/${value}`;
  return value;
}

export async function loadHomePageByDashboards(sandbox) {
  const filterDashboardsByAccessScript = createFilterByScript('dashboard', 'access_script', sandbox);
  const [ dashboard ] = filterDashboardsByAccessScript(await db.model('dashboard').where({ __inserted: true }));

  if (dashboard) return `/dashboard/${dashboard.alias}`;
}

export async function loadHomePageByFirstView(sandbox) {
  const result = {};

  const models = uniqBy(orderBy(filter(db.getModels(), (m) => ['custom'].includes(m.type)), 'id'), 'id')

  for (const model of models) {
    const access = await SECURITY.checkAccess('model', model, sandbox)
    if (access) {
      const views = await db.model('view').where({ model: model.id, __inserted: true }).orderBy('order', 'desc')

      for (const view of views) {
        const access = await SECURITY.checkAccess('view', view, sandbox)
        if (access) {
          result.model = model;
          result.view = view;
          break;
        }
      }
    }
    if (result.view) break;
  }

  if (result.view) return `/${result.model.alias}/view/${result.view.type}/${result.view.alias}`
}
