import { each } from 'lodash-es';

const lineTypes = ['oneline', 'multiline'];
const scriptTypes = ['plain', 'condition', 'access', 'permission', 'filter'];
const plainScrips = { oneline: 'const test = true;', multiline: 'const test1 = true;\nconst test2 = false;' };
const conditionScripts = { oneline: 'true', multiline: 'false ||\ntrue' };

describe('Sandbox', () => {
  describe('.executeScript()', () => {
    each(lineTypes, (lineType) => {
      each(scriptTypes, (scriptType) => {
        it(`It should execute ${lineType} scripts (${scriptType})`, () => {
          const script = scriptType === 'plain' ? plainScrips[lineType] : conditionScripts[lineType];
          const path = `${scriptType}_script`;
          const expected = scriptType === 'plain' ? undefined : true;
          const result = sandbox.executeScript(script, path);

          expect(result).toEqual(expected);
        });
      })
    });

    it(`It should execute multiline scripts with oneline comment at the end of input`, () => {
      expect(() => {
        sandbox.executeScript('const test1 = true;\n// comment', 'plain');
      }).not.toThrow();
    });
  });
});
