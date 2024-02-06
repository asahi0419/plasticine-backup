/* eslint-disable no-new-func */

import Api from '../api';
import { modifyScriptWithModelPrivileges } from '../../security/privileges';

function wrapScript(input = '', namespace = {}, path = '') {
  let script = input;
  const fn = /await/.test(script) ? 'async function' : 'function';
  const isReturningScript = /client|condition|access|required_when|readonly_when|hidden_when|permission|filter|menu_visibility/.test(path);
  
  if (isReturningScript) {
    if (!(script.split('\n').length > 1)) {
      script = `return ${script.replace(/^return /, '')}`;
    }
  }

  if (namespace.modelId) {
    script = modifyScriptWithModelPrivileges(script, namespace.modelId);
  }

  return `return (${fn}(){
${script}
})()`;
}

export default class StandardExecutor {
  constructor(...args) {
    this.context = Api.create(...args).context;
  }

  perform(input, context = {}, path = '') {
    const script = (input || '').trim();
    if (!script) return false;
    
    const scope = {
      k: Object.keys({ ...this.context, ...context }),
      v: Object.values({ ...this.context, ...context }),
    };

    try {
      return new Function(...scope.k, wrapScript(script, context, path))(...scope.v);
    } catch (error) {
      console.log(script);
      console.error(error);

      if (this.handleError) this.handleError(error);
    }
  }
}
