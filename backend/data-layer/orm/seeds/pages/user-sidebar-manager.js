export default {
  name: 'User Sidebar manager',
  alias: 'user_sidebar_manager',
  template: `<Manager.UserSidebar
  formFields={p.getVariable('formFields')}
  record={p.getVariable('record')}
  onChange={p.updateRecord}
/>`,
  access_script: '!p.currentUser.isGuest()',
  server_script: `const { record_id } = p.getRequest();

try {
  const userSidebarModel = await p.getModel('user_sidebar');
  userSidebarModel.setOptions({ includeNotInsertedRecords: true });

  const user_sidebar = await userSidebarModel.findOne({ id: record_id });

  p.response.json({
    record: user_sidebar.attributes,
  });
} catch (error) {
  p.response.error(error);
}`,
  __lock: ['delete'],
};
