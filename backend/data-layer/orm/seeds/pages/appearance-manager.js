export default {
  name: 'Appearance manager',
  alias: 'appearance_manager',
  template: `<Manager.Appearance
  record={p.getVariable('record')}
  formFields={p.getVariable('formFields')}
  onChange={p.updateRecord}
/>`,
  access_script: '!!p.internalVariables.loadingPagesByApi',
  component_script: '',
  server_script: `const params = p.getRequest();

try {
  const model = await p.getModel('appearance');
  model.setOptions({ includeNotInsertedRecords: true });
  const record = await model.findOne({ id: params.record_id }).raw();

  p.response.json({ record });
} catch (error) {
  p.response.error(error);
}`,
  __lock: ['delete'],
};
