import { compact, filter, get, each, find } from 'lodash-es';

import db from '../../../../../../data-layer/orm/index.js';
import { getUserSetting } from '../../../../../../business/setting/index.js';
import { parseOptions, mergeActions } from '../../../../../../business/helpers/index.js';

const ACTIONS_TYPES = {
  grid: ['view_button', 'view_choice', 'view_menu_item'],
  map: ['view_button', 'view_menu_item', 'map_item', 'map_item_context', 'map_item_tip', 'map_draw'],
  chart: ['view_button', 'view_menu_item'],
  card: ['view_button', 'view_menu_item', 'card_view'],
  calendar: ['view_button', 'view_menu_item', 'calendar_action'],
  topology: ['view_button', 'view_menu_item', 'topology_item', 'topology_item_context'],
};

const DEFAULT_VIEW_TYPE = {
  grid: true,
  map: true,
  card: true,
  calendar: true,
  chart: true,
  topology: true,
};

const DEFAULT_VIEW_MODE = {
  main_view: true,
  related_view: true,
  embedded_view: true,
  attachment_view: true,
  reference_view: false,
  global_reference_view: false,
  rtl: false,
  rtl_popup: false,
};

export const loadResourceWithUserSettings = async (type, whereClause, user, exec_by) => {
  const resourceModel = db.getModel(type);
  const resource = await db.model(type).where({ ...whereClause, __inserted: true }).getOne();
  if (!resource) return [];

  const userSetting = await getUserSetting(user, resourceModel, resource.id, exec_by);
  return [resource, userSetting];
};

export const loadFilters = (view) => {
  const filterIds = compact([view.filter].concat(view.predefined_filters || []));
  if (!filterIds.length) return []
  return db.model('filter').whereIn('id', filterIds).where({ __inserted: true });
};

export const loadActions = async (model, sandbox, view, query) => {
  const actions = await db.model('action')
    .where({ __inserted: true })
    .whereIn('model', compact([model.id, model.inherits_model]))
    .whereIn('type', ACTIONS_TYPES[view.type]);

  return filterActionsByOptions(mergeActions(actions, model), view, query);
};

const filterActionsByOptions = (actions, view = {}, query = {}) => {
  return filter(actions, (action) => {
    const options = parseOptions(action.options);
    const viewType = view.type;
    const viewMode = get(query, 'exec_by.type', 'main_view');

    options.view_type = {...DEFAULT_VIEW_TYPE, ...options.view_type};
    options.view_mode = {...DEFAULT_VIEW_MODE, ...options.view_mode};

    return (!viewType || options.view_type[viewType]) &&
      options.view_mode[viewMode] &&
      (!options.by_alias || options.by_alias === view.alias);
  });
}
