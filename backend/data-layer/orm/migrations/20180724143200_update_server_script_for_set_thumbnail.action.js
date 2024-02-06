/* eslint-disable */

import getTableName from './helpers/table-name.js';

const modelsTableName = getTableName({ id: 1, type: 'core' });

export const up = (knex, Promise) => {
  return knex(modelsTableName).where({ alias: 'action' }).limit(1)
    .then(([model]) => model && knex(getTableName(model))
      .where({ alias: 'set_thumbnail' }).update({
        server_script: `const { ids, embedded_to } = p.getRequest();

try {
  const attachmentModel = await p.getModel('attachment');
  const grcModel = await p.getModel('global_references_cross');
  const model = await p.getModel(embedded_to.model);

  const grcRecords = await grcModel.find({ target_model: model.id, target_record_id: embedded_to.record_id });
  const grcSourceRecordsIds = grcRecords.map(({ attributes }) => attributes.source_record_id);
  const attachmentRecords = await attachmentModel.find({ id: grcSourceRecordsIds });
  const record = attachmentRecords.find((record) => record.attributes.id === ids.sort()[0]);

  await record.assignAttributes({ thumbnail: true }) && record.save();
  await attachmentRecords.map(r => (record.id !== r.id) && (r.assignAttributes({ thumbnail: false }) && r.save()));

  p.actions.openView('__self');
} catch (error) {
  p.response(error);
}`
      }));
};

export const down = (knex, Promise) => {
  return Promise.resolve();
};
