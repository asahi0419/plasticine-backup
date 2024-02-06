import { isPlainObject, isNil } from 'lodash-es';

import logger from '../logger/index.js';
import { parseOptions } from '../helpers/index.js';

export default async (appearance, sandbox) => {
  try {
    return await executeAppearanceScript(appearance, sandbox);
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

    result.options = parseOptions(appearance.options);

    if (isPlainObject(result)) return [ result ];
    if (isNil(result)) return [];

    return result;
  } catch (error) {
    logger.error(error);
    return Promise.resolve([]);
  }
}
