export default {
  name: 'Privilege manager',
  alias: 'privilege_manager',
  access_script: `p.currentUser.canAtLeastRead('privilege') && p.currentUser.canAtLeastRead(p.getRequest().__headers.referer.split('/').slice(-2, -1).join())`,
  server_script: `const params = p.getRequest();
const result = { owners: [], privileges: [] };

const hasUAccess = p.currentUser.canAtLeastRead('user');
const hasGAccess = p.currentUser.canAtLeastRead('user_group');

try {
  const mModel = await p.getModel('model');
  const model = result.model = await mModel.findOne({ alias: params.model }).raw();

  const uModel = await p.getModel('user');
  await p.iterEach(uModel.find().raw(), (r) => result.owners.push({
    text: '[U] ' + lodash.compact([r.name, r.surname]).join(' '),
    value: { type: 'user', id: r.id },
  }));

  const gModel = await p.getModel('user_group');
  await p.iterEach(gModel.find().raw(), (r) => result.owners.push({
    text: '[UG] ' + r.name,
    value: { type: 'user_group', id: r.id },
  }));

  const pModel = await p.getModel('privilege');
  await p.iterEach(pModel.find({ model: model.id }).raw(), (r) => {
    const privilege = { id: r.id, level: r.level };
    privilege.owner = result.owners.find((o) => o.value.type === r.owner_type && (o.value.id || null) === r.owner_id)
      || { text: 'All users', value: { type: 'all_users' } };

    if ((r.owner_type === 'user')       && !hasUAccess) privilege.disabled = true;
    if ((r.owner_type === 'all_users')  && !hasUAccess) privilege.disabled = true;
    if ((r.owner_type === 'user_group') && !hasGAccess) privilege.disabled = true;

    result.privileges.push(privilege);
  });

  if (!hasUAccess) result.owners = lodash.filter(result.owners, (o = { value: {} }) => (o.value.type !== 'user'));
  if (!hasGAccess) result.owners = lodash.filter(result.owners, (o = { value: {} }) => (o.value.type !== 'user_group'));

  p.response.json(result);
} catch (error) {
  p.response.error(error);
}`,
  component_script: `{
  initState: (initial = true) => {
    const model = p.getVariable('model');
    const owners = p.getVariable('owners');
    lodash.some(owners, (o = { value: {} }) => (o.value.type === 'user')) && owners.unshift({ text: 'All users', value: { type: 'all_users' }});

    const levels = [
      { text: 'No privileges', value: 'none' },
      { text: 'Read', value: 'read' },
      { text: 'Read/Write', value: 'read_write' },
      { text: 'Admin', value: 'admin' },
    ];

    const privileges = p.getVariable('privileges').map((privilege) => {
      const level = levels.filter((l) => l.value === privilege.level)[0];
      return { ...privilege, level };
    });

    return { model, owners, levels, privileges, canSubmit: p.currentUser.canAtLeastWrite('privilege') };
  },
  serialize: () => {
    const privileges = page.state.privileges.map(({ id, owner = {}, level }) => {
      const { value = {} } = owner;

      return {
        id,
        level: level.value,
        owner_type: value.type,
        owner_id: value.id,
      };
    });

    return { model: p.getVariable('model').id, privileges };
  },

  privilegeFormatter: ({ id, owner = {}, level, disabled }) => {
    const { value = {} } = owner;

    return {
      id,
      disabled,
      text: (owner.text || 'All users') + ' [' + level.text + ']',
      value: {
        level: level.value,
        owner_type: value.type,
        owner_id: value.id || null,
      },
    };
  },

  handleSubmit: () => p.getAction('save_privileges')(page.serialize()),
  handlePrivilegesChanged: (privileges) => {
    const last = lodash.last(privileges);
    const rest = privileges.slice(0, -1);

    const found = lodash.find(rest, (o = {}) => ((o.owner || {}).text === last.owner.text) && ((o.level || {}).text === last.level.text));
    const foundPartial = lodash.find(rest, (o = {}) => ((o.owner || {}).text === last.owner.text) && ((o.level || {}).text !== last.level.text));

    if (found) {
      privileges = lodash.filter(rest, (o = {}) => !(((o.owner || {}).text === found.owner.text) && ((o.level || {}).text === found.level.text))).concat(last);
    } else if (foundPartial) {
      if (confirm(p.translate('partially_privilege_duplicate_found', { owner: foundPartial.owner.text, level: foundPartial.level.text }))) {
        privileges = lodash.filter(rest, (o = {}) => (o.owner || {}).text !== foundPartial.owner.text).concat(last);
      } else {
        return;
      }
    }

    page.setState({ privileges });
  },

  renderSubmitButton: () => {
    if (!page.state.canSubmit) return;
    return <Button basic type="submit" floated="right" onClick={page.handleSubmit}>Submit</Button>;
  },

  renderHeader: () => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', height: '60px' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
          <Header as="h2" floated="left">{\`Privileges [\${page.state.model.name}]\`}</Header>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
          {page.renderSubmitButton()}
        </div>
      </div>
    );
  },

  renderMixSelect: () => {
    const items = page.state.privileges;
    const formatter = page.privilegeFormatter;
    const onChange = page.handlePrivilegesChanged;

    const angleRightTitle = p.translate('static.please_select_privilege_user_group_and_level_to_create');
    const angleLeftTitle = p.translate('static.please_select_privilege_user_group_and_level_to_delete');

    return (
      <MixSelect title="Privileges" angleRightTitle={angleRightTitle} angleLeftTitle={angleLeftTitle} items={items} formatter={formatter} onChange={onChange} height={500}>
        <MixSelect.Basket title="Users and groups" name="owner" items={page.state.owners} multiple pillowed />
        <MixSelect.Basket title="Privilege levels" name="level" items={page.state.levels} height={150} />
      </MixSelect>
    );
  },
}`,
  template: `<div>
  {page.renderHeader()}
  <Divider style={{ margin: '0 0 15px' }} clearing />
  {page.renderMixSelect()}
</div>`,
  actions: [
    {
      name: 'Save privileges',
      alias: 'save_privileges',
      model: 'privilege',
      condition_script: 'p.currentUser.canAtLeastWrite()',
      server_script: `const { model, privileges } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const privilegeModel = await p.getModel('privilege');

  const record = await modelModel.findOne({ id: model });
  const existedPrivileges = await privilegeModel.find({ model });

  const existedIds = existedPrivileges.map(p => p.getValue('id'));
  const newIds = privileges.map(p => p.id);

  const jobs = [];

  privileges.filter(p => !existedIds.includes(p.id)).forEach(p => jobs.push(privilegeModel.insert({ ...p, model })));
  existedPrivileges.filter(p => !newIds.includes(p.getValue('id'))).forEach(p => jobs.push(p.delete()));

  await Promise.all(jobs);

  p.actions.goBack();
} catch (error) {
  p.response.error(error)
}`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
