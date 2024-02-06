import { isEmpty } from 'lodash-es';

import db from '../../data-layer/orm/index.js';

export const checkAccess = async (model, record = {}, sandbox, body = {}) => {
  model = db.getModel(model);

  switch (model.alias) {
    case 'model':
      record = replaceAttachmentByTargetRecord(record, body);
      record = record.access_script ? record : db.getModel(record.alias || record.id);

      return sandbox.executeScript(record.access_script, `${model.alias}/${record.id}/access_script`, { modelId: record.id });
    case 'view':
    case 'form':
    case 'user_sidebar':
      record = record.condition_script ? record : await db.model(model.alias).where(record).getOne();
      return sandbox.executeScript(record.condition_script, `${model.alias}/${record.id}/condition_script`, { modelId: db.getModel(record.model).id })
    case 'page':
    case 'tutorial':
    case 'tutorial_article':
    case 'dashboard':
      record = record.access_script ? record : await db.model(model.alias).where(record).getOne();
      return sandbox.executeScript(record.access_script, `${model.alias}/${record.id}/access_script`, { modelId: model.id })
    case 'web_socket':
    case 'web_service':
      record = record.access_script ? record : await db.model(model.alias).where(record).getOne();
      return sandbox.executeScript(record.access_script, `${model.alias}/${record.id}/access_script`)
  }
};

const replaceAttachmentByTargetRecord = (record, body) => {
  if (record.alias == 'attachment' && !isEmpty(body)) {
    const { data = {} } = body;
    const { attributes = {} } = data;
    if (!isEmpty(attributes.target_record)) {
      record = { id: attributes.target_record.split('/')[0] };
    }
  }
  return record;
}
