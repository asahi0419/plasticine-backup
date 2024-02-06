import { isPlainObject, isNil } from 'lodash-es';

import logger from '../../../../../logger/index.js';
import Selector from '../../../../../record/fetcher/selector.js';
import ModelProxy from '../../../../../sandbox/api/model/index.js';
import QueryBuilder from '../../../../../sandbox/api/query/builder.js';
import { getSetting } from '../../../../../setting/index.js';

export default async (model, properties, appearance = {}, params = {}, sandbox) => {
  const modelProxy = new ModelProxy(model, sandbox);
  const selectorScope = new Selector(model, sandbox).getScope(params.filter, params.hidden_filter);
  const queryBuilder = new QueryBuilder(modelProxy, selectorScope);

  sandbox.addInternalVariable('queryBuilder', queryBuilder);

  const limits = getSetting('limits');
  const script = `const execute = ${appearance.script || 'async (scope) => ({ records: await scope.find() })'};
return execute(p.internalVariables.queryBuilder.limit(${limits.map}));`

  try {
    const result = await sandbox.executeScript(script, `appearance/${appearance.id}/script`);

    if (isPlainObject(result)) return [result];
    if (isNil(result)) return [];

    return result;
  } catch (error) {
    logger.error(error);

    return [];
  }
}