export default {
  name: 'Layout manager',
  alias: 'layout_manager',
  template: `<Manager.Layout
  type={p.getVariable('type')}
  record={p.getVariable('record')}
  formFields={p.getVariable('formFields')}
  onChange={p.updateRecord}
  getAction={p.getAction}
/>`,
  access_script: '!!p.internalVariables.loadingPagesByApi',
  component_script: '',
  server_script: `const { record_id, type = 'layout', exec_by } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const layoutModel = await p.getModel('layout');
  layoutModel.setOptions({ includeNotInsertedRecords: true });
  const layout = await layoutModel.findOne({ id: record_id });

  if (type === 'user_setting') {
    const userSettingModel = await p.getModel('user_setting');
    const customizedLayout = await userSettingModel
      .findOne({
        user: p.currentUser.getValue('id'),
        model: layoutModel.getValue('id'),
        type: exec_by.type,
        record_id,
      });
    if (customizedLayout) layout.setValue('options', customizedLayout.getValue('options'));
  }

  p.response.json({
    record: layout.attributes,
    type
  });
} catch (error) {
  p.response.error(error);
}`,
  actions: [
    {
      name: 'Save user layout',
      alias: 'save_user_layout',
      condition_script: 'p.currentUser.canAtLeastRead()',
      server_script: `const request = p.getRequest();

try {
  const layoutModel = await p.getModel('layout');
  const usModel = await p.getModel('user_setting', { check_permission: false });

  const record = await usModel.findOne({
    user: p.currentUser.getValue('id'),
    model: layoutModel.getValue('id'),
    record_id: request.record_id,
    type: request.context,
  }) || await usModel.build({});

  await record.update({
    user: p.currentUser.getValue('id'),
    model: layoutModel.getValue('id'),
    record_id: request.record_id,
    type: request.context,
    options: JSON.stringify(request.options),
  });

  p.response.json({ status: true });
} catch (error) {
  p.response.error(error);
}`,
      __lock: ['delete'],
    },
    {
      name: 'Reset user layout',
      alias: 'reset_user_layout',
      condition_script: 'p.currentUser.canAtLeastRead()',
      server_script: `const { record_id } = p.getRequest();

Promise.all([ p.getModel('layout'), p.getModel('user_setting') ])
  .then(([layoutModel, userSettingModel]) => {
    userSettingModel.setOptions({ check_permission: { destroy: false }});
    return userSettingModel.find({
      user: p.currentUser.getValue('id'),
      model: layoutModel.getValue('id'),
      record_id,
    });
  })
  .then(([record]) => record && record.delete())
  .then(() => p.response.json({ status: true }))
  .catch((error) => p.response.error(error));`,
      __lock: ['delete'],
    },
  ],
  __lock: ['delete'],
};
