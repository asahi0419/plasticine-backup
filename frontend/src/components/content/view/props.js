import qs from 'qs';
import React from 'react';
import { pick } from 'lodash/object';
import { find, filter, reduce } from 'lodash/collection';
import { isUndefined, cloneDeep, isEmpty } from 'lodash/lang';

import RecordDetail from '../../shared/record-detail';
import { getModel } from '../../../helpers';

const DEFAULT_VIEW_OPTIONS = {
  autorefresh: { rate: 0 },
  page: { size: 30 },
}

export default class ViewProps {
  static create(props, context, callbacks) {
    return new ViewProps().process(cloneDeep(props), context, callbacks);
  }

  process(props = {}, context = {}, callbacks = {}) {
    const { viewProps = {} } = props;
    const { view = {} } = viewProps;
    const { type } = view;

    this.applyConditions(props, context);
    this.applyDefaults(props, callbacks);

    return {
      props: this.getProps(props),
      configs: this.getConfigs(props),
      callbacks: this.getCallbacks(props),
    };
  }

  applyConditions(props = {}, context = {}) {
    const { viewProps = {}, viewOptions = {} } = props;
    const { sandbox } = context;
    const { model = {}, view = {}, actions = [] } = viewProps;
    const { embedded_to = {} } = viewOptions;

    viewProps.actions = filter(actions, (a = {}) => {
      const visible = [
        'card_view',
        'map_item',
        'map_item_context',
        'map_item_tip',
        'map_draw',
        'topology_item',
        'topology_item_context',
        'calendar_action'
      ];

      if (a.group || visible.includes(a.type)) {
        return true;
      }

      if (sandbox) {
        const modelId = ((model.alias === 'attachment') && (embedded_to.model))
          ? getModel(embedded_to.model).id
          : model.id;
        return sandbox.executeScript(a.condition_script, { modelId }, `action/${a.id}/condition_script`);
      }
    });

    if (['grid'].includes(view.type)) {
      const value = sandbox.executeScript('p.currentUser.canDefineLayout()', { modelId: model.id }, `permission/${view.type}/script`);
      view.show_layout_manager = view.show_layout_manager || value;
    }

    if (['calendar', 'card', 'chart', 'grid', 'map'].includes(view.type)) {
      const value = sandbox.executeScript('p.currentUser.canDefineFilter()', { modelId: model.id }, `permission/${view.type}/script`);
      view.quick_search_enabled = view.quick_search_enabled && value;
      view.filter_panel_enabled = view.filter_panel_enabled && value;
    }
  }

  applyDefaults(props = {}, callbacks = {}) {
    this.props = props.props || {};
    this.configs = props.configs || {};
    this.callbacks = { ...(props.callbacks || {}), ...callbacks };

    this.setDefaultProps(props);
    this.setDefaultConfigs(props);
    this.setDefaultCallbacks(props);
  }

  setDefaultProps(props = {}) {
    const { viewProps = {} } = props;
    const { view = {} } = viewProps;
    const { type } = view;

    if (type === 'grid') {
      if (isUndefined(this.props.context)) this.props.context = '';
    }
  }

  setDefaultConfigs(props = {}, callbacks = {}) {
    const { viewProps = {}, viewOptions = {} } = props;

    const { model = {}, view = {}, actions = [], fields = [] } = viewProps;
    const { type } = view;

    const { autorefresh = {}, page = {} } = viewOptions;
    const { rate = DEFAULT_VIEW_OPTIONS.autorefresh.rate } = autorefresh;
    const { size = DEFAULT_VIEW_OPTIONS.page.size } = page;

    if (['topology', 'calendar', 'card', 'chart', 'grid', 'map'].includes(type)) {
      if (isUndefined(this.configs.showPredefined)) this.configs.showPredefined = getDefaultPredefined(props);
      if (isUndefined(this.configs.showFilterManager)) this.configs.showFilterManager = view.filter_panel_enabled;
      if (isUndefined(this.configs.showQuicksearch)) this.configs.showQuicksearch = view.quick_search_enabled;
      if (isUndefined(this.configs.showModelName)) this.configs.showModelName = true;
      if (isUndefined(this.configs.showHeaderMenu)) this.configs.showHeaderMenu = true;
      if (isUndefined(this.configs.showHeaderActions)) this.configs.showHeaderActions = true;
      if (isUndefined(this.configs.withAutorefresh)) this.configs.withAutorefresh = {
        options: getDefaultAutorefreshOptions(),
        enabled: view.auto_refresh_enabled,
        rate: +rate,
      };
      if (isUndefined(this.configs.withMetadata)) this.configs.withMetadata = getDefaultMetadata(model, view, actions);
      if (isUndefined(this.configs.withExport)) this.configs.withExport = { enabled: !!fields.length };
      if (isUndefined(this.configs.statical)) this.configs.statical = false;
      if (isUndefined(this.configs.compact)) this.configs.compact = false;
    }

    if (['card', 'grid'].includes(type)) {
      if (isUndefined(this.configs.withPaginator)) {
        this.configs.withPaginator = {
          options: getDefaultPageOptions(viewOptions),
          enabled: view.paginator_enabled,
          position: ['bottom'],
          size: +size,
        };
      } else {
        this.configs.withPaginator = {
          options: getDefaultPageOptions(viewOptions),
          enabled: view.paginator_enabled,
          position: ['bottom'],
          size: +size,
          ...this.configs.withPaginator,
        };
      }

      if (type === 'card') {
        if (isUndefined(this.configs.showSorterManager)) this.configs.showSorterManager = view.sorting_enabled;
      }

      if (type === 'grid') {
        if (isUndefined(this.configs.showLayoutManager)) this.configs.showLayoutManager = view.show_layout_manager;
        if (isUndefined(this.configs.showGroupActions)) this.configs.showGroupActions = !!find(fields, { alias: 'id' }) && view.group_actions_enabled;
        if (isUndefined(this.configs.withCellEdit)) this.configs.withCellEdit = view.cell_edit_enabled;
        if (isUndefined(this.configs.withFirstCellLink)) this.configs.withFirstCellLink = true;
        if (isUndefined(this.configs.selectable)) this.configs.selectable = view.group_actions_enabled;
        if (isUndefined(this.configs.rowselect)) this.configs.rowselect = false;

        this.configs.withPaginator.position = this.configs.statical ? ['top'] : ['top', 'bottom'];
      }
    }
  }

  setDefaultCallbacks(props = {}) {
    const { viewProps = {} } = props;
    const { view = {} } = viewProps;
    const { type, alias, id } = view;

    if (type === 'grid') {
      if (isUndefined(this.callbacks.itemQuickAction)) {
        this.callbacks.itemQuickAction = (model, record) => {
          const parent = { type: 'view', vtype: type, alias, id };

          return (
            <RecordDetail
              modelAlias={model.alias}
              recordId={record.id}
              parent={parent}
            />
          );
        };
      }
    }
  }

  getProps(props = {}) {
    const { viewProps = {}, viewOptions = {} } = props;
    const { view = {} } = viewProps;
    const { type } = view;

    const keys = {
      common: [
        'model',
        'fields',
        'columns',
        'actions',
        'filters',
        'view',
        'context',
        'ready',
      ],

      calendar: [],
      card: [
        'layout',
        'records',
      ],
      chart: [
        'error',
        'scope',
        'builder',
        'version',
      ],
      grid: [
        'hash',
        'layout',
        'records',
        'selectedRecords',
      ],
      map: [
        'features',
        'sections',
        'groups',
        'properties',
        'appearance',
      ],
    };

    const propsCommon = pick(viewProps, keys['common']);
    const propsSpecific = pick(viewProps, keys[type]);
    const propsOptions = { viewOptions };
    const propsOverride = this.props;

    const propsResult = {
      ...propsCommon,
      ...propsSpecific,
      ...propsOptions,
      ...propsOverride,
    };

    propsResult.actions = [
      ...(propsCommon.actions || []),
      ...(propsSpecific.actions || []),
      ...(propsOptions.actions || []),
      ...(propsOverride.actions || []),
    ];

    if (!(propsResult.fields || []).length) {
      propsResult.error = i18n.t('no_columns_to_display', { defaultValue: 'There are no columns to display. Please contact your system administrator to check user permissions.' });
    }

    return propsResult;
  }

  getConfigs(props = {}) {
    const { viewProps = {} } = props;
    const { view = {} } = viewProps;
    const { type } = view;

    const showModelName = this.configs.showModelName;
    const showPredefined = this.configs.showPredefined;
    const showFilterManager = this.configs.showFilterManager;
    const showSorterManager = this.configs.showSorterManager;
    const showGroupActions = this.configs.showGroupActions;
    const showLayoutManager = this.configs.showLayoutManager;

    const withCellEdit = this.configs.withCellEdit;
    const withFirstCellLink = this.configs.withFirstCellLink;
    const showHeaderMenu = this.configs.showHeaderMenu;
    const showHeaderActions = this.configs.showHeaderActions;
    const showQuicksearch = this.configs.showQuicksearch;
    const withPaginator = this.configs.withPaginator;
    const withAutorefresh = this.configs.withAutorefresh;
    const withMetadata = this.configs.withMetadata;
    const withExport = this.configs.withExport;

    const selectable = !this.configs.selectable ? false : !this.configs.statical;
    const rowselect = this.configs.rowselect;
    const statical = this.configs.statical;
    const compact = this.configs.compact;

    const keys = {
      calendar: {
        showModelName,
        showPredefined,
        showFilterManager,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withMetadata,
        withExport,
        statical,
      },
      card: {
        showModelName,
        showPredefined,
        showFilterManager,
        showSorterManager,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withPaginator,
        withMetadata,
        withExport,
        statical,
      },
      chart: {
        showModelName,
        showPredefined,
        showFilterManager,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withMetadata,
        withExport,
        statical,
      },
      grid: {
        showModelName,
        showPredefined,
        showFilterManager,
        showLayoutManager,
        showGroupActions,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withPaginator,
        withMetadata,
        withCellEdit,
        withFirstCellLink,
        withExport,
        selectable,
        rowselect,
        statical,
        compact,
      },
      map: {
        showModelName,
        showPredefined,
        showFilterManager,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withMetadata,
        withExport,
        statical,
      },
      topology: {
        showModelName,
        showPredefined,
        showFilterManager,
        showQuicksearch,
        withAutorefresh,
        showHeaderMenu,
        showHeaderActions,
        withMetadata,
        withExport,
        statical,
      },
    };

    return keys[type];
  }

  getCallbacks(props = {}) {
    const { viewProps = {} } = props;
    const { view = {} } = viewProps;
    const { type } = view;

    const keys = {
      calendar: [
        'handleAction',
        'updateView',
        'updateUserSettings',
      ],
      card: [
        'handleAction',
        'updateView',
        'syncCount',
        'onItemClick',
        'updateUserSettings',
      ],
      chart: [
        'handleAction',
        'updateView',
        'updateUserSettings',
        'exportView',
      ],
      grid: [
        'handleAction',
        'updateView',
        'exportView',
        'syncCount',
        'onItemClick',
        'itemQuickAction',
        'updateUserSettings',
      ],
      map: [
        'handleAction',
        'updateView',
        'exportView',
      ],
      topology: [
        'handleAction',
        'updateView',
        'exportView',
      ],
    };

    return pick(this.callbacks, keys[type]);
  }
}

function getDefaultPredefined(props = {}) {
  const filters = reduce(props.viewProps.view.predefined_filters || [], (result, id) => {
    const filter = find(props.viewProps.filters, { id });
    return filter ? [ ...result, filter ] : result;
  }, []);

  return { filters };
}

function getDefaultAutorefreshOptions() {
  return [ 0, 15000, 30000, 60000, 120000, 180000, 300000 ];
};

function getDefaultPageOptions(viewOptions) {
  const { exec_by = {} } = viewOptions;
  return (exec_by.type === 'main_view') ? [ 10, 20, 30, 50, 100 ] : [ 10, 20, 30 ];
};

function getDefaultMetadata(model, view, actions) {
  const params = qs.stringify({ filter: `model = ${model.id}` });

  return {
    enabled: !!find(actions, { alias: 'view_metadata' }),
    simple: true,
    text: i18n.t('menu_metadata', { defaultValue: 'Metadata' }),
    options: [
      { enabled: true, text: i18n.t('menu_model', { defaultValue: 'Model' }), url: `/model/form/${model.id}` },
      { enabled: true, text: i18n.t('menu_fields', { defaultValue: 'Fields' }), url: `/field/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_actions', { defaultValue: 'Actions' }), url: `/action/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_db_rules', { defaultValue: 'DB rules' }), url: `/db_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_views', { defaultValue: 'Views' }), url: `/view/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_layouts', { defaultValue: 'Layouts' }), url: `/layout/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_appearances', { defaultValue: 'Appearances' }), url: `/appearance/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_filters', { defaultValue: 'Filters' }), url: `/filter/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_forms', { defaultValue: 'Forms' }), url: `/form/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_permissions', { defaultValue: 'Permissions' }), url: `/permission/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_privileges', { defaultValue: 'Privileges' }), url: `/${model.alias}/privileges` },
      { enabled: true, text: i18n.t('menu_escalation_rules', { defaultValue: 'Escalation Rules' }), url: `/escalation_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_ui_rules', { defaultValue: 'UI rules' }), url: `/ui_rule/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_scheduled_tasks', { defaultValue: 'Scheduled tasks' }), url: `/scheduled_task/view/grid/default?${params}` },
      { enabled: true, text: i18n.t('menu_planned_tasks', { defaultValue: 'Planned tasks' }), url: `/planned_task/view/grid/default?${params}` },
    ]
  };
}
