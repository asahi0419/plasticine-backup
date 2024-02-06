import { map, compact, isEmpty } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import { loadData } from '../../../humanizer/types/global-reference.js';
import { parseOptions } from '../../../../helpers/index.js';
import { spreadHumanizedAttribute } from '../helpers.js';

export default (field, sandbox) => async (records) => {
  const values = compact(map(records, field.alias));
  const { targetRecordsMap, crossRecordsMap, crossModelsMap, modelValueGenerators } = await loadData(field, values, sandbox);

  spreadHumanizedAttribute(field, records, (value) => {
    if (!value) return;

    const parsed = parseOptions(value);

    const crossRecord = isEmpty(parsed) ? crossRecordsMap[value] : { source_field: field.id, target_model: db.getModel(parsed.__type || parsed.model).id, target_record_id: parsed.id };
    if (!crossRecord) return;

    const crossModel = crossModelsMap[crossRecord.target_model];
    if (!crossModel) return;

    const targetRecord = targetRecordsMap[crossModel.alias][crossRecord.target_record_id];
    if (!targetRecord) return;

    return modelValueGenerators[crossModel.alias](targetRecord, crossRecord, crossModel);
  });
};
