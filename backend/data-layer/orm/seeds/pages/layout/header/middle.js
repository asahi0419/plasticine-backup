export default {
  name: 'Middle header',
  alias: 'middle_header',
  template: `<div className="middle-header">
  <div className="middle-header-pc">
    <div>
      <div style={{ display: 'flex', lineHeight: '49px', fontSize: '23px', margin: '0 15px' }}>
        {page.renderLayoutActions()}
        {page.renderHiddenActions()}
      </div>
    </div>
    <div style={{ flex: 1 }}></div>
    <div style={{ flex: 1 }}></div>
    <div style={{ textAlign: 'right', lineHeight: '49px', fontSize: '16px' }}>
      {page.renderTutrLink()}
      {page.renderUserLink()}
      {page.renderHomeLink()}
    </div>
  </div>
  <div className="middle-header-mc">
    <Header as="h3">
      <Icon name="block layout" />
      <Header.Content>{window.APP_NAME}</Header.Content>
    </Header>
  </div>
</div>`,
  component_script: `{
  initState: (initial = true) => {
    page.layoutActionsAliases = ['show_sidebars', 'show_sidebar', 'show_content_only'];
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
        show_sidebar: 'list layout',
        show_content_only: 'bars'
      };
      const name = iconNamesByAliases[alias];
      const link = page.props.layoutMode !== alias;

      let style = { height: '100%' };
      if (alias === 'show_content_only') style = { ...style, fontWeight: 'bold', fontSize: '25px', lineHeight: '49px', marginLeft: '-2px', marginRight: 0 };

      const onClick = () => {
        window.dispatchEvent(new CustomEvent("switchLayoutMode"));
        action();
      };

      return { key, link, name, onClick, style };
    });
  },

  getHiddenActions() {
    const actions = lodash.filter(page.props.actions, (action = {}) => !page.layoutActionsAliases.includes(action.alias));

    return lodash.map(actions, ({ alias, name }, key) => {
      return { key, name, onClick: p.getAction(alias), fontSize: '16px' };
    });
  },
  getContentTutorialPath() {
    const { view = {}, metadata = {} } = p.store.getState() || {};
    const { content = {} } = view;

    if (content.type === 'view') {
      const meta = metadata[\`\${content.model}/view/\${content.params.viewAlias}\`] || {};
      return (lodash.find(meta.view, { alias: content.params.viewAlias }) || {}).tutorial;
    }

    if (content.type === 'form') {
      const model = lodash.find(metadata.app.model, { alias: content.model }) || {};
      const meta = metadata[\`\${content.model}/form\`] || {};
      return (lodash.find(meta.form, { model: model.id }) || {}).tutorial;
    }
  },

  renderTutrLink() {
    const path = page.getContentTutorialPath() || p.getSetting('tutorial').path;
    if (!path) return;

    return (
      <Link
        to={path}
        target="_blank"
        style={{ marginRight: '5px', color: 'rgba(0, 0, 0, 0.87)'}}
        title={p.translate('open_tutorial_in_new_tab', { defaultValue: 'Open tutorial in the new tab' })}
      ><Icon name="question circle outline" /></Link>
    );
  },
  renderUserLink() {
    const userFullName = [ p.currentUser.getValue('name'), p.currentUser.getValue('surname') ].filter(el => !!el).join(' ');

    return (
      <Link
        to={\`/user/form/\${p.currentUser.getValue('id')}\`}
        style={{ marginRight: '5px', color: 'rgba(0, 0, 0, 0.87)'}}
        title={p.translate('show_user_settings', { defaultValue: 'Show User Settings' })}
      >{userFullName}</Link>
    );
  },
  renderHomeLink() {
    return (
      <Link
        to={\`/user/form/\${p.currentUser.getValue('id')}\`}
        style={{ marginRight: '20px', color: 'rgba(0, 0, 0, 0.87)' }}
        title={p.translate('user_home_page', { defaultValue: 'User Home Page' })}
      ><Icon name="home" /></Link>
    );
  },
  renderLayoutActions() {
    const actions = page.getLayoutActions();
    if (!actions.length) return;

    return lodash.map(actions, (props) => <Icon {...props} />);
  },
  renderHiddenActions() {
    const actions = page.getHiddenActions();
    if (!actions.length) return;

    return (
      <Dropdown trigger={<Button basic floated="right" icon="ellipsis horizontal" className="middle-header-more-actions-trigger" />} icon={null} style={{ display: 'flex', flex: 1 }}>
        <Dropdown.Menu style={{ top: 40, fontSize: '14px' }}>
          {lodash.map(actions, (props) => <Dropdown.Item {...props}>{props.name}</Dropdown.Item>)}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}`,
  styles: `flex: auto;

.middle-header {
  height: 100%;
}

.middle-header-pc {
  display: flex;
  flex: auto;
}

.middle-header-mc {
  display: none;
  align-items: center;
  justify-content: center;
  height: 100%;

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

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  width: auto;

  .middle-header-pc {
    display: none;
  }

  .middle-header-mc {
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
