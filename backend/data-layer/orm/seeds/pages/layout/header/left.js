export default {
  name: 'Left header',
  alias: 'left_header',
  template: `<Link className="left-header" to="/">
  <div className="left-header-pc">
    <Header as="h3">
      <Icon name="block layout" />
      <Header.Content>{window.APP_NAME}</Header.Content>
    </Header>
  </div>
  <div className="left-header-mc">
    <div className="actions">
      {page.renderLayoutActions()}
      {page.renderHiddenActions()}
    </div>
  </div>
</Link>`,
  component_script: `{
  initState: (initial = true) => {
    page.layoutActionsAliases = ['show_sidebar', 'show_content_only'];

    // TODO:
    // page.layoutActionsAliases = ['show_sidebars', 'show_sidebar', 'show_content_only'];
  },

  getLayoutActions() {
    const state = store.getState();

    const hasSidebar = !!lodash.find(state.metadata.app.page, { alias: 'sidebar_container' });
    if (!hasSidebar) return [];

    const isUserSidebarReady = (page.props.readyComponents || []).includes('user_sidebar');
    const ationsAliases = isUserSidebarReady ? page.layoutActionsAliases : lodash.filter(page.layoutActionsAliases, (alias) => (alias !== 'show_sidebars'));

    return lodash.map(ationsAliases, (alias, key) => {
      const action = p.getAction(alias);

      const iconNamesByAliases = {
        show_sidebars: 'grid layout',
        show_sidebar: 'bars',
        show_content_only: 'close'
      };
      const name = iconNamesByAliases[alias];
      const link = page.props.layoutMode === alias;

      let style = { height: '100%' };
      if (alias === 'show_sidebar') style = { ...style, fontWeight: 'bold', lineHeight: '49px', marginLeft: '-2px', marginRight: 0 };
      if (alias === page.props.layoutMode) style = { ...style, display: 'none' };

      const onClick = () => {
        window.dispatchEvent(new CustomEvent("switchLayoutMode"));
        action();
      };

      return { key, link, name, onClick, style };
    });
  },

  getHiddenActions() {
    return [];

    // TODO:
    // const actions = lodash.filter(page.props.actions, (action = {}) => !page.layoutActionsAliases.includes(action.alias));
    //
    // return lodash.map(actions, ({ alias, name }, key) => {
    //   return { key, name, onClick: p.getAction(alias), fontSize: '16px' };
    // });
  },

  renderLayoutActions() {
    const actions = page.getLayoutActions();
    if (!actions.length) return;

    return (
      <div className="layout-actions">
        {lodash.map(actions, (props) => <Icon {...props} />)}
      </div>
    );
  },

  renderHiddenActions() {
    const actions = page.getHiddenActions();
    if (!actions.length) return;

    const style = { display: 'flex', flex: 1 };
    const trigger = <Button basic floated="right" icon="ellipsis horizontal" className="middle-header-more-actions-trigger" />;

    return (
      <Dropdown className="hidden-actions" trigger={trigger} icon={null} style={style}>
        <Dropdown.Menu style={{ top: 40, fontSize: '14px' }}>
          {lodash.map(actions, (props) => <Dropdown.Item {...props}>{props.name}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}`,
  styles: `width: 210px;
border-right: 1px solid;

.left-header {
  height: 100%;
}

.left-header-pc {
  display: flex;
  align-items: center;
  height: 100%;
  padding-left: 10px;

  .header {
    margin: 0;
  }

  .content {
    padding-left: 8px !important;
    padding-top: 3px;
  }

  .icon, .content {
    color: #fff !important;
  }
}

.left-header-mc {
  display: none;
  height: 100%;

  .actions {
    line-height: 49px;
    font-size: 20px;

    .layout-actions {
      text-align: center;
      width: 49px;
    }
  }
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  width: auto;
  border-right: 0;

  .left-header-pc {
    display: none;
  }

  .left-header-mc {
    display: flex;
  }
}`,

  access_script: '!p.currentUser.isGuest()',
  __lock: ['delete'],
  actions: [
    {
      name: 'Show sidebars',
      alias: 'show_sidebars',
      type: 'header',
      position: '-100',
      client_script: 'p.actions.switchLayoutMode("show_sidebars") && false;',
      condition_script: 'true',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Show sidebar',
      alias: 'show_sidebar',
      type: 'header',
      position: '-100',
      client_script: 'p.actions.switchLayoutMode("show_sidebar") && false;',
      condition_script: 'true',
      active: true,
      __lock: ['delete'],
    },
    {
      name: 'Show content only',
      alias: 'show_content_only',
      type: 'header',
      position: '-100',
      client_script: 'p.actions.switchLayoutMode("show_content_only") && false;',
      condition_script: 'true',
      active: true,
      __lock: ['delete'],
    },
  ],
};
