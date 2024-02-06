import { isPlainObject, isNil } from 'lodash-es';

import db from '../../data-layer/orm/index.js';
import logger from '../logger/index.js';

export default async (appearance, sandbox, req) => {
  try {
    const appearanceResult = await executeAppearanceScript(appearance, sandbox);
    const coordinates = await getTopologyData(req, appearance);
    return { appearance: appearanceResult, coordinates };
  } catch (error) {
    logger.error(error);
    return {};
  }
};

async function executeAppearanceScript(appearance = {}, sandbox) {
  const script = `const execute = ${appearance.script || 'async (scope) => ({ records: await scope.find() })'};
return execute();`

  try {
    const result = await sandbox.executeScript(script, `appearance/${appearance.id}/script`);

    if (isPlainObject(result)) return [ result ];
    if (isNil(result)) return [];

    return result;
  } catch (error) {
    logger.error(error);
    return Promise.resolve([]);
  }
}

async function getTopologyData(req, appearance) {
  const { exec_by, embedded_to } = req.body;
  let filter;

  if (exec_by.type === 'main_view') {
    const view = await db.model('view').where({ model: req.model.id, alias: exec_by.alias }).getOne();
    filter = { view_id: view.id };
  } else { // embedded
    const model_id = embedded_to.model_id;
    const record_id = embedded_to.record_id;
    const appearance_id = appearance.id;
    filter = { model_id, record_id, appearance_id };
  }

  const coordinates = await db.model('topology_data').where(filter).getOne();
  return coordinates || {};
}