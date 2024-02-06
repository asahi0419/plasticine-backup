import vm from 'vm';

import { createScriptExecutor } from '../helpers.js';

describe('Sandbox', () => {
  describe('Helpers', () => {
    describe('createScriptExecutor', () => {
      it('Should return script executor of type function', () => {
        const executeScript = createScriptExecutor();

        expect(typeof executeScript).toEqual('function');
      });
      it('Should return script executor cabaple to run scripts in vm context', () => {
        const executeScript = createScriptExecutor();

        const context = {};
        const expected = 'expected';
        const vmContext = new vm.createContext({ context });
        const script = { code: `context.result = '${expected}'`, path: 'script/path' };

        executeScript(vmContext, script);
        expect(context.result).toEqual(expected);
      });
    });
  });
});
