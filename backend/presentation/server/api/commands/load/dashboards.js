import lodash from 'lodash-es';
import Promise from 'bluebird';

import db from '../../../../../data-layer/orm/index.js';
import * as Helpers from '../../../../../business/helpers/index.js';
import { USER_ACTIVITIES }  from './constants.js';
import { serializer, createFilterByScript } from './helpers.js';
import { logUserActivity } from '../../../../../business/logger/user-activity-logger.js';

export default async (req, res) => {
  const filterDashboardsByAccessScript = createFilterByScript('dashboard', 'access_script', req.sandbox);

  const dashboards = await db.model('dashboard').where({ __inserted: true })
  const dashboardsFiltered = filterDashboardsByAccessScript(dashboards);
  const dashboardsWithUserSettings = await decorateWithUserSettings(req.user, dashboardsFiltered);
  const dashboardsProcessed = await processDashboards(dashboardsWithUserSettings)

  const actions = await db.model('action')
    .where({ model: db.getModel('dashboard').id, __inserted: true })
    .whereIn('type', ['dashboard_button']);

  const result = lodash.concat(
    serializer(dashboardsProcessed, 'dashboard', { translate: ['name'], req }),
    serializer(actions, 'action', { translate: ['name'], req }),
  );

  res.json({ data: lodash.compact(result) });

  logActivity(req);
};

async function decorateWithUserSettings(user, dashboards) {
  const customizedDashboards = await db.model('user_setting')
    .where({ model: db.getModel('dashboard').id, user: user.id })
    .whereIn('record_id', lodash.map(dashboards, 'id'));

  if (!customizedDashboards.length) return dashboards;
  const customizedDashboardsMap = lodash.keyBy(customizedDashboards, 'record_id');

  dashboards.forEach((dashboard) => {
    if (customizedDashboardsMap[dashboard.id]) {
      dashboard.options = customizedDashboardsMap[dashboard.id].options;
    }
  });

  return dashboards;
}

async function processDashboards(dashboards = []) {
  await Promise.each(dashboards, async (dashboard) => {
    const options = Helpers.parseOptions(dashboard.options)

    await Promise.each(options.layout || [], async (item = {}) => {
      await Promise.each(item.tabs || [], async (tab = {}) => {
        const model = db.getModel(tab.options.model)
        const view = await db.model('view').where({ id: tab.options.view }).getOne()

        tab.options.model = model.alias
        tab.options.view = view.alias

        if (view.filter) {
          const filter = await db.model('filter').where({ id: view.filter }).getOne()
          if (filter) tab.options.filter = filter.query
        }
      })
    })

    dashboard.options = JSON.stringify(options)
  })

  return dashboards
}

async function logActivity(req) {
  if (Helpers.getAliasFromURL((req.headers.headers || {}).referer)) {
    await logUserActivity({
      user: req.user,
      headers: req.headers,
      url: req.originalUrl,
      activity: USER_ACTIVITIES.Dashboard
    });
  }
}
