import vm from 'vm';

export function createScriptExecutor() {
  const compiledScripts = {};

  return (vmContext, script = {}) => {
    const { code, path, timeout } = script;
    const scriptKey = `${path}|${code}`;

    if (!compiledScripts[scriptKey]) {
      compiledScripts[scriptKey] = new vm.Script(code, {
        displayErrors: true,
        filename: `SCRIPT_PATH:${path}`,
      });
    }

    return compiledScripts[scriptKey].runInContext(vmContext, { timeout });
  };
}
