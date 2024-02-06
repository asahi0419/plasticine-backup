export default {
  name: 'Permission manager',
  alias: 'permission_manager',
  template: `<Manager.Permission
  formFields={p.getVariable('formFields')}
  fields={p.getVariable('fields')}
  model={p.getVariable('model')}
  record={p.getVariable('record')}
  onChange={p.updateRecord}
  fetchVariables={p.updateVariables}
/>`,
  access_script: '!!p.internalVariables.loadingPagesByApi',
  component_script: '',
  server_script: `const { record_id, modelId } = p.getRequest();

try {
  const modelModel = await p.getModel('model');
  const fieldModel = await p.getModel('field');
  const permissionModel = await p.getModel('permission');

  permissionModel.setOptions({ includeNotInsertedRecords: true });

  const permission = await permissionModel.findOne({ id: record_id });

  if (modelId) permission.setValue('model', modelId);
  const permissionModelId = permission.getValue('model');

  const model = await modelModel.findOne({ id: permissionModelId });
  const fields = await fieldModel.find({ model: permissionModelId });

  p.response.json({
    record: permission.attributes,
    fields: fields.map(({ attributes }) => attributes),
    model: model ? model.attributes : {}
  });
} catch (error) {
  p.response.error(error)
}`,
  __lock: ['delete'],
};
