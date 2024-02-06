import Promise from 'bluebird';
import stringify from 'json-stringify-safe';
import { isPlainObject, isEqual } from 'lodash-es';

import db from '../../../../../data-layer/orm/index.js';
import * as ERROR from '../../../../error/index.js';
import * as HELPERS from '../../../../helpers/index.js';

const DEFAULT_TIMEOUT = 60000;

export default (sandbox) => async (script, params) => {
  const input = {
    params: processParams(params),
    script: processScript(script, params),
  };
  const output = {
    result: null,
    message: null,
    status: 'ok',
  };
  const context = {
    start_time: new Date().getTime(),
  };

  try {
    const result = await sandbox.executeScript(input.script, 'sandbox');
    result && result.error
      ? processError(result.error, output)
      : processResult(result, input, output);
  } catch (error) {
    processError(error, output);
  } finally {
    output.exec_time = new Date().getTime() - context.start_time;
  }

  try {
    await cleanup(sandbox);
  } catch (error) {
    console.log(error);
  }

  return output;
};

function processScript(script = '', params = {}) {
  if (typeof script !== 'string') {
    const message = `Parameter 'script' in execSS(...) must be a string`;
    throw new ERROR.ParamsNotValidError(message);
  }

  return `//# script_timeout: ${params.timeout || DEFAULT_TIMEOUT}
  const execute = (executor) => executor();

try {
  const result = await execute(async () => {
${script}
  });
  return result;
} catch (error) {
  return { error };
}
`;
}

function processParams(params) {
  if (!isPlainObject(params)) {
    const message = `Parameter 'params' in execSS(...) must be a plain object`;
    throw new ERROR.ParamsNotValidError(message);
  }

  const exp_result = HELPERS.parseOptions(params.exp_result);
  if (Object.values(exp_result).length) params.exp_result = exp_result;

  return params;
}

async function processResult(result, input, output) {
  output.result = result === undefined ? 'undefined' : stringify(result);

  if (input.params.exp_result) {
    output.status = isEqual(result, input.params.exp_result) ? 'pass' : 'not_pass';
  }
}

async function processError(error, output) {
  error.description = error.description || error.message;
  error.description = error.description ? `:\n${error.description}` : '';
  error.stack = `\n\n${error.stack.split('\n').slice(1).join('\n')}`;

  output.status = 'error';
  output.message = `${error.name}${error.description}${error.stack}`;
}

async function cleanup(sandbox) {
  const sandboxModels = db.getModels((m) => HELPERS.parseOptions(m.options).sandbox);

  await Promise.each(sandboxModels, async (model) => {
    const manager = await db.model('model', sandbox).getManager();
    await manager.destroy(model);
  });
}
