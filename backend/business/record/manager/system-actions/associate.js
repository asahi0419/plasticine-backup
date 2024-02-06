import { isString } from 'lodash-es';

import db from '../../../../data-layer/orm/index.js';
import loadRTLs from '../../fetcher/loaders/rtl.js';

export default async ({ target }, record, sandbox) => {
  if (!target) return;
  if (!isString(target)) return;

  const [modelId, recordId, fieldId] = target.split('/');
  if (!modelId || !recordId || !fieldId) return;
  const targetModel = db.model(modelId, sandbox);
  const targetRecord = await targetModel.where({ id: recordId }).getOne();
  if (!targetRecord) return;

  const targetField = db.getField({ id: +fieldId });
  if (!targetField) return;

  const recordManager = await targetModel.getManager(false);

  switch (targetField.type) {
    case 'reference':
      return recordManager.update(targetRecord, { [targetField.alias]: record.id });
    case 'reference_to_list':
      await loadRTLs([targetRecord], targetModel.model);
      const listValues = targetRecord[targetField.alias].slice();
      listValues.push(record.id);
      return recordManager.update(targetRecord, { [targetField.alias]: listValues });
    default:
      return;
  }
};
