export default {
  name: 'Right header',
  alias: 'right_header',
  component_script: `{
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

  handleSystemClick() {
  const { project_name, db_provider, extensions = {}, services = [], build = {} } = p.getSettings();
  const servicesMap = services.map((s) => \`\${s.name}:\\n    Build: \${s.build} (\${s.branch})\\n    Built at: \${s.date}\`);
  const dbProvider = { postgres: 'PostgreSQL', mysql: 'MySQL' }[db_provider];

  const info = [
    \`Project name: \${project_name}\\nDB provider: \${dbProvider}\`,
    \`Version: \${build.version}\\nBuild: \${build.id} (\${build.branch})\\nBuilt at: \${build.created_at}\`,
  ];

  if (servicesMap.length) info.push(\`Addon Services:\\n  \${servicesMap.join('\\n  ')}\`);
  if (extensions.plugins.length) info.push(\`Extensions:\\n  Plugins:\\n    \${extensions.plugins.join('\\n    ')}\`);

  alert(info.join('\\n\\n'));
},

  handleLogoutClick() {
    return PlasticineApi.logout();
  },

  handleUserClick() {
    history.push(\`/user/form/\${p.currentUser.getValue('id')}\`);
  },

  renderPCMenuButton() {
    const trigger = (
      <div>
        <Icon name="setting" />
        <Icon name="dropdown" style={{ position: 'relative', left: '7px', bottom: '7px' }} />
      </div>
    );

    return (
      <Menu.Menu position="right" title={p.translate('settings', { defaultValue: 'Settings' })}>
        <DropdownNestable trigger={trigger} className="link item">
        <Dropdown.Menu id="expandable">
          <Dropdown.Header>{p.translate('settings', { defaultValue: 'Settings' })}:</Dropdown.Header>
          <ThemeSwitcherContainer/>
          <Dropdown.Divider />
          <Dropdown.Item onClick={page.handleSystemClick}>{p.translate('system_info', { defaultValue: 'System Info' })}</Dropdown.Item>
          <Dropdown.Item onClick={page.handleLogoutClick}>{p.translate('logout', { defaultValue: 'Logout' })}</Dropdown.Item>
        </Dropdown.Menu>
        </DropdownNestable>
      </Menu.Menu>
    );
  },

  renderMCTutrButton() {
    const path = page.getContentTutorialPath() || p.getSetting('tutorial').path;
    if (!path) return;

    return <Link to={path} target="_blank"><div className="right-header-mc-tutor-link">?</div></Link>;
  },

  renderMCMenuButton() {
    return (
      <Menu.Menu position="right">
        <DropdownNestable trigger={<div tabIndex="0" className="right-header-mc-menu-trigger">{p.currentUser.getValue('name').substring(0, 1)}</div>} className="link item">
          <Dropdown.Menu id="expandable">
            <Dropdown.Item onClick={page.handleUserClick}>{p.translate('user', { defaultValue: 'User' })}</Dropdown.Item>
            <ThemeSwitcherContainer/>
            <Dropdown.Item onClick={page.handleSystemClick}>{p.translate('system_info', { defaultValue: 'System Info' })}</Dropdown.Item>
            <Dropdown.Item onClick={page.handleLogoutClick}>{p.translate('logout', { defaultValue: 'Logout' })}</Dropdown.Item>
          </Dropdown.Menu>
        </DropdownNestable>
      </Menu.Menu>
    );
  },
}`,
  template: `<div className="right-header">
  <div className="right-header-pc">
    {page.renderPCMenuButton()}
  </div>
  <div className="right-header-mc">
    {page.renderMCTutrButton()}
    {page.renderMCMenuButton()}
  </div>
</div>`,
  styles: `width: 90px;
border-left: 1px solid;

.right-header,
.right-header-pc,
.right-header-mc,
.right.menu,
.ui.dropdown {
  height: 100%;
  width: 100%;
}

.right-header-mc {
  display: none;
}

.ui.dropdown {
  padding-left: 18px;

  .menu {
    left: initial;
    right: 0;
  }

  > .dropdown.icon {
    position: relative;
    top: -7px;
  }
}

i.icon.setting {
  height: 100%;
  margin: 0px;
  font-size: 32px;
  line-height: 50px;
}

#expandable.menu {
  .header { text-align: center }

  .item {
    padding-left: 2em !important;

    &:hover > .menu { left: -93% !important; right: 100% !important }

    & > .dropdown.icon {
      position: absolute;
      left: -2px;
      transform: scaleX(-1);
    }
  }
}

@media only screen and (max-width: {UI_TABLET_MAX_SIZE}px) {
  width: auto;
  padding-left: 0;
  border-left: 0;

  .right.menu {
    padding: 0 11px;
    text-align: center;
  }

  .right-header-pc {
    display: none;
  }

  .right-header-mc {
    display: flex;
  }

  .right-header-mc-menu-trigger {
    width: 26px;
    height: 26px;
    background-color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 26px;
    font-size: 15px;
    position: relative;
    top: 12px;
    border: 0;
    color: {headerBackground};

    &:focus {
      background-color: {headerBackground};
      color: {header};
      box-shadow: inset 0px 0px 0px 1px {header};
    }
  }

  .right-header-mc-tutor-link {
    width: 26px;
    height: 26px;
    background-color: white;
    border-radius: 50%;
    text-align: center;
    line-height: 26px;
    font-size: 15px;
    position: relative;
    top: 12px;
    border: 0;
    background-color: {headerBackground};
    color: {header};
    box-shadow: inset 0px 0px 0px 1px {header};
  }

  .ui.dropdown {
    padding-left: 0;

    .menu {
      left: initial;
      right: 0;
    }

    > .dropdown.icon {
      display: none;
      top: 0;
    }
  }
}`,
  access_script: '!p.currentUser.isGuest()',
  __lock: ['delete'],
};
