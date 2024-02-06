import Promise from 'bluebird';
import { map } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import getCollectionHumanizer from '../../humanizer/types/index.js';

import * as SECURITY from '../../../../security/index.js';

const PROCESSORS = {
  attachments: processAttachments,
};

export default (associations, fetcher, records) => {
  if (!associations) return [];

  return Promise.map(associations, (association) => {
    const processor = PROCESSORS[association.alias];
    if (processor) return processor(association, fetcher, records);
  });
};

async function processAttachments(association, fetcher, records) {
  const { params, sandbox } = fetcher;
  const attachmentTargetRecordField = db.getField({ model: db.getModel('attachment').id, alias: 'target_record' });
  const crossRecords = await db.model('global_references_cross')
  .where({ source_field: attachmentTargetRecordField.id, target_model: fetcher.model.id })
  .whereIn('target_record_id', map(records, 'id'));

  const attachments = await db.model('attachment').whereIn('target_record', map(crossRecords, 'id'));

  if (params.humanize) {
    const model = db.model('attachment').model;
    const fields = db.getFields({ model: model.id });
    await Promise.map(fields, field => getCollectionHumanizer(field, sandbox, params)(attachments));
  }

  const attachmentsModel = await db.getModel('attachment')
  const checkAccess = await SECURITY.checkAccess('model', attachmentsModel, sandbox)
  
  return {
    result: checkAccess ? attachments : [],
    crossRecords: checkAccess ? crossRecords : [],
    association,
  };
}
