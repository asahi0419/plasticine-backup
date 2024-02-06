import { getSetting } from '../setting/index.js';
import { modifyScriptWithModelPrivileges } from '../security/privileges.js';

export default class Script {
  constructor(code, path, context = {}) {
    this.context = context || {};
    this.path = path;

    this.__code = cleanupCode(code || 'false');

    this.extractMetaLines();
    this.interpolateCode();
    this.optimizeCode();
  }

  get timeout() {
    const [ resource ] = this.path.split('/');
    const setting = getSetting('timeout') || {};
    const timeout = setting[resource] || setting.default || 2500;
    return parseInt(this.metaVariables.script_timeout) || parseInt(timeout) || 5000;
  }

  get code() {
    if (this.path.startsWith('global_script')) return this.__code;

    const isConditionScript = /condition|access|required_when|readonly_when|hidden_when|permission|filter/.test(this.path);
    const functionBody = isConditionScript ? wrapConditionScript(this.__code, this.path) : this.__code;
    const functionDeclaration = /await/.test(this.__code) ? 'Promise.method(async function' : '(function';

    return `(${functionDeclaration}(){
${functionBody}
})())`;
  }

  extractMetaLines() {
    const codeLines = this.__code.split(/\r?\n/);
    this.metaVariables = {};

    for (var i = 0; i < codeLines.length; i++) {
      const line = cleanupCode(codeLines[i]);
      if (!/^\/\/#.*/.test(line)) break;

      codeLines.shift();
      const { key, value } = parseMetaLine(line);

      if (key && value) this.metaVariables[key] = value;
    }

    this.__code = cleanupCode(codeLines.join('\r\n'));
  }

  interpolateCode() {
    const { modelId } = this.context;
    if (modelId) this.__code = modifyScriptWithModelPrivileges(this.__code, modelId);
  }

  optimizeCode() {
    if (['true', 'false'].includes(this.__code)) {
      this.calculatedResult = this.__code === 'true';
    }
  }
}

function cleanupCode(code) {
  return code.trim()
}

function parseMetaLine(line) {
  const [key, value] = cleanupCode(line.replace('//#', '')).split(':');
  return { key, value: value.trim() };
}

function wrapConditionScript(script, path) {
  if (/p.response/.test(script)) return `p.log.error('Illegal p.response invocation inside condition script: ${path}')`
  if (/return /.test(script)) return script;

  script = script.replace(/^return\s+/, '');

  return /\r|\n/.test(script)
    ? `return ${script.startsWith('(function')
      ? script
      : script.split(/\r?\n|\|\|/)
              .filter(line => line.length && (line !== ' '))
              .map(line => `(${line.trim()})`)
              .join(' || ')}`
    : `return ${script}`;
}
