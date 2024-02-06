import Promise from 'bluebird';

import db from '../../../../data-layer/orm/index.js';

const processors = {
  reference_to_list: referenceToListProcessor,
};

export default function (service) {
  const record = service.sandbox.record.attributes;
  const virtualFields = service.modelFields.filter(({ type }) => db.schema.VIRTUAL_FIELDS.includes(type));

  return Promise.map(virtualFields, (field) => {
    const processor = processors[field.type];
    return processor && processor(record, field, service.sandbox);
  });
}

async function referenceToListProcessor(record, field, sandbox) {
  const rows = await db.model('rtl').where({ source_field: field.id, source_record_id: record.id });
  return Promise.map(rows, row => db.model('rtl', sandbox).destroyRecord(row, false));
}
