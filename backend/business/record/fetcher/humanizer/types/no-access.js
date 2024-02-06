export default (field, sandbox) => (records) => {
  records.forEach((record) => {
    record.__humanAttributes = record.__humanAttributes || {};
    record.__humanAttributes[field.alias] = sandbox.translate('static.no_access', { defaultValue: 'No access' });
  });
}
