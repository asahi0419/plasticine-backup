// The page is used as a reference from left menu user settings

export default {
  name: 'Sidebar container',
  alias: 'sidebar_container',
  server_script: `try {
  p.response.json({
    system: await getSidebarSystem(),
    user: await getSidebarUser(),
  })
} catch (error) {
  p.response.error(error)
}

async function getSidebarSystem() {
  const page = await db.model('page').where({ alias: 'sidebar_container' }).getOne();
  const setting = await db.model('user_setting').where({
    user: p.currentUser.getValue('id'),
    record_id: page.id,
    model: db.getModel('page').id
  }).getOne() || {};

  return helpers.parseOptions(setting.options || '{}');
};

async function getSidebarUser() {
  const sidebar = await loadSidebarUser();
  if (!sidebar) return

  const pages = await loadSidebarUserPages(sidebar);
  const actions = await loadSidebarUserActions(sidebar);
  const dashboards = await loadSidebarUserDashboards(sidebar);

  return {
    model: p.translate(db.getModel('user_sidebar'), 'model'),
    record: p.translate(sidebar, 'user_sidebar', ['name']),
    pages: p.translate(pages, 'page', ['name']),
    actions: p.translate(actions, 'action', ['name']),
    dashboards: p.translate(dashboards, 'dashboard', ['name']),
  };
};

async function loadSidebarUser() {
  const records = await db.model('user_sidebar').where({ __inserted: true, active: true });

  for (const record of records) {
    const result = await p.checkAccess('user_sidebar', record)
    if (result) return record
  }
};

async function loadSidebarUserActions(sidebar) {
  const ids = getSidebarUserComponentIds(sidebar, 'action')

  return db.model('action')
    .where({ __inserted: true, active: true, type: 'user_sidebar' })
    .whereIn('id', ids)
};

async function loadSidebarUserPages(sidebar) {
  const ids = getSidebarUserComponentIds(sidebar, 'page')
  const records = await db.model('page')
    .where({ __inserted: true })
    .whereIn('id', ids);

  return Promise.filter(records, (record) => p.checkAccess('page', record))
};

async function loadSidebarUserDashboards(sidebar) {
  const ids = getSidebarUserComponentIds(sidebar, 'dashboard')
  const records = await db.model('dashboard')
    .where({ __inserted: true })
    .whereIn('id', ids);

  return Promise.filter(records, (record) => p.checkAccess('dashboard', record))
};

function getSidebarUserComponentIds(sidebar, component) {
  const { components = {} } = helpers.parseOptions(sidebar.options);
  const { options = {} } = components;

  return lodash.compact(lodash.map(Object.values(options), component));
}`,
  component_script: `{
  initState: () => {
    return {
      models: [],
      views: [],
    }
  },

  shouldComponentUpdate: (nextProps, nextState) => {
    if (!lodash.isEqual(nextState.ready, page.state.ready)) return true
    if (!lodash.isEqual(nextProps.styles, page.props.styles)) return true
    
    return false
  },

  componentDidMount: async () => {
    page.setState({ ready: false })

    const { data } = await PlasticineApi.loadModels({ exec_by: { type: 'sidebar' } });
    const { entities } = PlasticineApi.normalize(data)

    store.dispatch({ type: 'APP_METADATA_FULFILLED', payload: entities });

    const sandbox = new Sandbox();
    const entitiesModel = lodash.orderBy(lodash.map(Object.values(entities.model), (r) => lodash.pick({ ...r, order: r.order || 0 }, ['id', 'alias', 'type', 'name', 'plural', 'order', 'menu_visibility'])), ['order'], ['desc'])
    const models = lodash.filter(entitiesModel, model => sandbox.executeScript(model.menu_visibility, { modelId: model.id }, \`model/\${model.id}/menu_visibility\`));
    const modelsMap = lodash.keyBy(models, 'id');
    const entitiesViews = lodash.orderBy(lodash.map(Object.values(entities.view), (r) => lodash.pick({ ...r, order: r.order || 0 }, ['id', 'alias', 'name', 'type', 'order', 'model'])), ['order', 'name'], ['desc', 'asc'])
    const views = lodash.filter(entitiesViews, view => modelsMap[view.model])

    page.setState({
      models,
      views,
      ready: true
    })
  },

  handleUpdateSystemSidebar: (options) => {
    const { id } = page.props.page;

    return PlasticineApi.updateUserSettings('page', id, {
      type: 'sidebar_container',
      options
    });
  },

  renderSystemSidebar: () => {
    const { models, views } = page.state
    const { system: options = {} } = page.props.variables

    return (
      <SystemSidebar
        models={models}
        views={views}
        options={options}
        updateSidebar={page.handleUpdateSystemSidebar}
      />
    );
  },
  
  renderUserSidebar: () => {
    const { models, views } = page.state
    const { handleAction, variables = {} } = page.props
    const { model, record, actions, pages, dashboards } = variables.user || {}

    if (!record) return

    new Promise((resolve) => setTimeout(resolve, 100)).then(() => {
      store.dispatch({ type: 'APP_COMPONENT_READY', payload: 'user_sidebar' })
    })

    return (
      <UserSidebar
        handleAction={handleAction}
        model={model}
        record={record}
        models={models}
        views={views}
        pages={pages}
        actions={actions}
        dashboards={dashboards}
      />
    );
  },

  renderLoader: () => {
    if (page.state.ready) return

    return <Loader dimmer={true} />
  }
}`,
  template: `<div className="sidebar-container">
  <div style={{ width: '100%', height: '100%' }}>
    {page.renderUserSidebar()}
    {page.renderSystemSidebar()}
  </div>
  {page.renderLoader()}
</div>`,
  styles: `position: fixed;
overflow: hidden;

.sidebar-container {
  display: flex;
  width: 100%;
  height: 100%;
  background-color: {sidebarBackground};
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  .sidebar-container {
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
  }
}`,
  access_script: '!p.currentUser.isGuest()',
  __lock: ['delete'],
};
