/* eslint-disable */

import getTableName from './helpers/table-name.js';

export const up = async (knex) => {
  const modelsTableName = getTableName({ id: 1, type: 'core' });

  const [ fieldModel ] = await knex(modelsTableName).where({ alias: 'field' });
  const [ actionModel ] = await knex(modelsTableName).where({ alias: 'action' });
  const [ pageModel ] = await knex(modelsTableName).where({ alias: 'page' });
  const [ rtlModel ] = await knex(modelsTableName).where({ alias: 'rtl' });

  const fieldTableName = getTableName({ id: fieldModel.id, type: 'core' });
  const actionsTableName = getTableName({ id: actionModel.id, type: 'core' });
  const pagesTableName = getTableName({ id: pageModel.id, type: 'core' });
  const rtlTableName = getTableName({ id: rtlModel.id, type: 'core' });

  const [ actionsField ] = await knex(fieldTableName).where({ alias: 'actions', model: pageModel.id });
  if (!actionsField) return;

  const [ rightHeaderPage ] = await knex(pagesTableName).where({ alias: 'right_header' });
  if (!rightHeaderPage) return;

  await knex(pagesTableName).where({ alias: 'right_header' }).update({
    component_script: `{
    showSystemInfo() {
      const { project_name, db_provider, plugins = [], build = {} } = p.getSettings();
      const dbProvider = { postgres: 'PostgreSQL', mysql: 'MySQL' }[db_provider];

      const info = \`Project name: \${project_name}
  DB provider: \${dbProvider}
  Plugins: \${plugins.join(', ')}

  Version: \${build.version}
  Build: \${build.id} (\${build.branch})
  Built at: \${build.created_at}\`;

      alert(info);
    },

    handleLogout() {
      p.getAction('right_header_logout')();
    }
  }`,
    template: `<div className="right-header">
  <Menu.Menu position="right">
    <DropdownNestable trigger={<Icon name="setting" />} className="link item">
      <Dropdown.Menu id="expandable">
        <Dropdown.Header>{p.translate('settings', { defaultValue: 'Settings' })}:</Dropdown.Header>
        <ThemeSwitcherContainer/>
        <Dropdown.Divider />
        <Dropdown.Item onClick={page.showSystemInfo}>{p.translate('system_info', { defaultValue: 'System Info' })}</Dropdown.Item>
        <Dropdown.Item onClick={page.handleLogout}>{p.translate('logout', { defaultValue: 'Logout' })}</Dropdown.Item>
      </Dropdown.Menu>
    </DropdownNestable>
  </Menu.Menu>
</div>`,
  });

  await knex(actionsTableName).insert({
    name: 'Right header logout',
    alias: 'right_header_logout',
    condition_script: 'true',
    server_script: `try {
  await p.currentUser.getAccount().closeCurrentSession({ reason_to_close: 'manual' });
  p.response.json({ action: 'logout' });
} catch (error) {
  p.response.error(error);
}`,
    active: true,
    created_at: new Date(),
    created_by: 1,
    __inserted: true,
  });

  const [ logoutAction ] = await knex(actionsTableName).where({ alias: 'right_header_logout' });

  await knex(rtlTableName).insert({
    source_field: actionsField.id,
    source_record_id: rightHeaderPage.id,
    target_record_id: logoutAction.id
  });
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
