import { compact, map, isNaN } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import { loadResourceWithUserSettings } from './helpers.js';
import { serializer, loadTemplates } from '../helpers.js';
import loadGrid from './grid.js';
import loadMap from './map.js';
import loadChart from './chart.js';
import loadCard from './card.js';
import loadCalendar from './calendar.js';
import loadTopology from './topology.js';
import { ViewNotFoundError, NoAccessToViewError } from '../../../../../../business/error/index.js';
import logger from '../../../../../../business/logger/index.js';
import { logUserActivity } from '../../../../../../business/logger/user-activity-logger.js';
import { USER_ACTIVITIES } from '../constants.js';
import {findFirstAvailableResource} from "../../../../../../business/sandbox/api/p/actions/helpers.js";
import {getUserSetting} from "../../../../../../business/setting/index.js";

const LOADERS = {
  grid: loadGrid,
  map: loadMap,
  chart: loadChart,
  card: loadCard,
  calendar: loadCalendar,
  topology: loadTopology,
};

export default async (req, res) => {
  const { model, user, sandbox, params: { viewAlias }, query: { exec_by = {} } } = req;

  try {
    await assignParentToSandbox(req);

    const params = isNaN(+viewAlias) ? {model: model.id, alias:viewAlias} : {id : +viewAlias};

    let [view, userSetting] = await loadResourceWithUserSettings('view', params, user, exec_by);


    if(!view && viewAlias === '__first'){
      const query = {};

      if (['reference_view', 'rtl_popup', 'global_reference_view'].includes(exec_by.type)) {
        query.type = 'grid';
      }

      view = await findFirstAvailableResource(model.alias, 'view', sandbox, query);
      if (!view) throw new ViewNotFoundError();
      userSetting = await getUserSetting(user, model, view.id, exec_by);
    }
    
    if (!view) throw new ViewNotFoundError();

    await checkAccessToView(view, model, sandbox);
    await assignPredefinedFilters(view);

    const result = serializer([{ ...model, access_script: 'true' }], 'model', { translate: ['name', 'plural'], req });

    if (userSetting) {
      result.push(serializer(db.getModel('view'), 'model'));
      result.push(serializer(userSetting, 'user_setting'));
    }

    const data = await LOADERS[view.type](view, req, result);
    const templates = await loadTemplates(model);

    res.json({ data: compact(data), meta: { templates } });

    logActivity(req);

  } catch (error) {
    res.error(error);
  }
};

function assignParentToSandbox(req) {
  return req.parentModel && req.parentRecord
    ? req.sandbox.assignRecord(req.parentRecord, req.parentModel, 'parentRecord', { preload_data: false })
    : Promise.resolve();
}

export async function isViewAccessible(view, model, sandbox) {
  let hasAccess = false;

  try {
    hasAccess = await sandbox.executeScript(
        view.condition_script,
        `view/${view.id}/condition_script`,
        { modelId: model.id },
    );
  } catch (error) {
    return false;
  }

  return hasAccess;
}

export async function checkAccessToView(view, model, sandbox) {
  let hasAccess = false;

  try {
    hasAccess = await sandbox.executeScript(
      view.condition_script,
      `view/${view.id}/condition_script`,
      { modelId: model.id },
    );
  } catch (error) {
    logger.error(error);
  }

  if (!hasAccess) throw new NoAccessToViewError();

  // TODO: remove after implementing full featured sandbox on the frontend
  view.condition_script = 'true';

  return view;
}

async function assignPredefinedFilters(view) {
  const viewModel = db.getModel('view');
  const field = db.getField({ model: viewModel.id, alias: 'predefined_filters' });

  const crossRecords = await db.model('rtl')
    .where({ source_field: field.id, source_record_id: view.id })
    .select('target_record_id');

  view.predefined_filters = map(crossRecords, 'target_record_id');
}

async function logActivity(request) {
  if (request.query['exec_by']) {
    if(request.query.exec_by.type === 'main_view') {
      await logUserActivity({
        user: request.user,
        headers: request.headers,
        url: request.originalUrl,
        activity: USER_ACTIVITIES.View
      });
    }
  }
}
