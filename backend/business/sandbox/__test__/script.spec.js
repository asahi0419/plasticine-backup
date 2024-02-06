import { each } from 'lodash-es';

import Script from '../script/index.js';
import { getSetting } from '../../setting/index.js';
import { modifyScriptWithModelPrivileges } from '../../security/privileges.js';

beforeEach(async () => {
  jest.clearAllMocks();
});

describe('Sandbox', () => {
  describe('Script', () => {
    describe('constructor(code, path, context)', () => {
      it('Should correctly run', () => {
        jest.spyOn(Script.prototype, 'extractMetaLines');
        jest.spyOn(Script.prototype, 'interpolateCode');
        jest.spyOn(Script.prototype, 'optimizeCode');

        const path = 'script/path';
        const context = {};

        let result, code;

        // return 'false' if code is undefined
        code = undefined;
        result = new Script(code, path);
        expect(result.__code).toEqual('false');
        // return 'trimmed' if code is defined
        code = 'code  ';
        result = new Script(code, path);
        expect(result.__code).toEqual(code.trim());

        expect(result.context).toEqual(context);
        expect(result.path).toEqual(path);

        expect(Script.prototype.extractMetaLines).toBeCalled();
        expect(Script.prototype.interpolateCode).toBeCalled();
        expect(Script.prototype.optimizeCode).toBeCalled();
      });
    });

    describe('get timeout()', () => {
      it('Should return correct result', () => {
        const timeout = getSetting('timeout');
        const path = 'script/path';

        let result, expected, code;

        expected = timeout.default;
        code = '';
        result = new Script(code, path).timeout;
        expect(result).toEqual(expected)

        // extract timeout from metaline
        expected = 5000;
        code = `//#script_timeout: ${expected}`;
        result = new Script(code, path).timeout;
        expect(result).toEqual(expected)
      });
    });

    describe('get code()', () => {
      it('Should return correct result', () => {
        let result, expected, code, path;

        // return global scripts as is
        code = 'new Array()';
        path = 'global_script/script';
        expected = code;
        result = new Script(code, path).code;
        expect(result).toEqual(expected)

        // extract script in function wrapper
        code = 'new Array()';
        path = 'path/script';
        result = new Script(code, path).code;
        expect(result).toEqual(`((function(){\n${code}\n})())`);

        // extract script in async function wrapper
        code = 'await new Array()';
        path = 'path/script';
        result = new Script(code, path).code;
        expect(result).toEqual(`(Promise.method(async function(){\n${code}\n})())`);

        // wrap condition scripts
        each(['condition', 'access', 'required_when', 'readonly_when', 'hidden_when', 'permission', 'filter'], (path) => {
          // add automatic return
          code = 'new Array()';
          path = `${path}/script`;
          result = new Script(code, path).code;
          expect(result).toEqual(`((function(){\nreturn ${code}\n})())`);

          // as is if return present
          code = 'return new Array()';
          path = `${path}/script`;
          result = new Script(code, path).code;
          expect(result).toEqual(`((function(){\n${code}\n})())`);

          // as is if return present (multiline)
          code = 'const array = new Array()\rreturn array';
          path = `${path}/script`;
          result = new Script(code, path).code;
          expect(result).toEqual(`((function(){\n${code}\n})())`);

          // wrap and return conditions
          code = 'false ||\ntrue';
          path = `${path}/script`;
          result = new Script(code, path).code;
          expect(result).toEqual(`((function(){\nreturn (false) || (true)\n})())`);
        });
      });
    });

    describe('interpolateCode()', () => {
      it('Should correctly run', () => {
        let result, expected, code, path, context;

        code = 'p.currentUser.isAdmin()';
        path = 'script/path';
        context = {};
        result = new Script(code, path, context);
        expect(result.__code).not.toEqual(modifyScriptWithModelPrivileges(code, context.modelId));

        code = 'p.currentUser.isAdmin()';
        path = 'script/path';
        context = { modelId: 'modelId' };
        result = new Script(code, path, context);
        expect(result.__code).toEqual(modifyScriptWithModelPrivileges(code, context.modelId));
      });
    });
  });
});
