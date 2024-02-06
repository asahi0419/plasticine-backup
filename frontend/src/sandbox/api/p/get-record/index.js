import RecordProxy from '../record';
import ProxyRecord from '../../../../containers/content/form/proxy-record';
import { loadFormMetadata, loadRecordMetadata, getRecord } from '../../../../actions/db/load-form'

export default async (modelAliasOrId, recordId, params = {}) => {
  if (!modelAliasOrId) {
    console.error('Missing parameter \'model\' in p.getRecord(...)')
    return
  }
  if (!(lodash.isString(modelAliasOrId) || lodash.isNumber(modelAliasOrId))) {
    console.error('Parameter \'model\' in p.getRecord(...) should be a string or number')
    return
  }
  if (!recordId) {
    console.error('Missing parameter \'record_id\' in p.getRecord(...)')
    return
  }
  if (!lodash.isNumber(recordId)) {
    console.error('Parameter \'record_id\' in p.getRecord(...) should be a number')
    return
  }

  const { metadata = {} } = await loadFormMetadata(modelAliasOrId, recordId, params);
  const model = lodash.find(metadata.model, (m) => {
    if (lodash.isNumber(modelAliasOrId)) return m.id === modelAliasOrId;
    if (lodash.isString(modelAliasOrId)) return m.alias === modelAliasOrId;
  })

  const { metadata: db } = await loadRecordMetadata(model.alias, recordId, params);
  const record = getRecord(model.alias, recordId, db);

  return new RecordProxy(new ProxyRecord(record, {
    model: metadata.model,
    form: Object.values(metadata.form || {}),
    fields: Object.values(metadata.field || {}),
    actions: Object.values(metadata.action || {}),
    uiRules: Object.values(metadata.ui_rule || {}),
    extraFieldsAttributes: Object.values(metadata.extra_fields_attribute || {}),
  }))
}