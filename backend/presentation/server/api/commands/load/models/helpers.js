import Promise from 'bluebird';
import { map } from 'lodash-es';

import logger from '../../../../../../business/logger/index.js';

const FIELDS = {
  model: { access: 'access_script', model: 'id' },
  view: { access: 'condition_script', model: 'model' },
};

export const getAccessible = async (model, records, sandbox) => {
  const access = (records, accessField) => map(records, (r) => ({ ...r, [accessField]: 'true' }));

  const result = await Promise.filter(records, async (record) => {
    const fieldAlias = FIELDS[model].access;
    const script = record[fieldAlias] || 'false';
    const path = `${model}/${record.id}/${fieldAlias}`;
    const context = { modelId: record[FIELDS[model].model] };

    try {
      const result = await sandbox.executeScript(script, path, context);

      return result
    } catch (error) {
      logger.error(error);
      return false;
    }
  })

  return access(result, FIELDS[model].access);
}
